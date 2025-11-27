<?php
header('Content-Type: application/json');

// --- Database Configuration ---
$dbHost = '127.0.0.1';
$dbUser = 'root';
$dbPass = '1234'; // Ensure this is secure and ideally from a config file in production
$dbName = 'test';
$dbPort = 3306;

// --- File Upload Configuration ---
// Physical path on the server where files will be stored.
$uploadDir = __DIR__ . '/uploads/'; // Assumes 'uploads' folder is in the same directory as nn.php

// Base URL path from which images will be served.
// Example: If nn.php is at http://yourdomain.com/api/nn.php
// and you want images accessible via http://yourdomain.com/api/uploads/image.jpg
// then $uploadUrlPath = '/api/uploads/';
// If Express serves static files from 'uploads' at the root, it might be just '/uploads/'
$uploadUrlPath = '/uploads/'; // ADJUST THIS TO YOUR SERVER SETUP

$response = ['status' => 'error', 'message' => 'An unknown error occurred.'];

// --- Ensure uploads directory exists and is writable ---
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0775, true)) { // 0775 for permissions, true for recursive
        $response['message'] = 'Failed to create uploads directory. Please check permissions or create it manually: ' . $uploadDir;
        echo json_encode($response);
        exit;
    }
}
if (!is_writable($uploadDir)) {
    $response['message'] = 'Uploads directory is not writable: ' . $uploadDir;
    echo json_encode($response);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['imageFile']) && $_FILES['imageFile']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['imageFile']['tmp_name'];
        $originalFileName = $_FILES['imageFile']['name'];
        $fileSize = $_FILES['imageFile']['size'];
        // $fileType = $_FILES['imageFile']['type']; // You can use this for more validation if needed
        $fileNameCmps = explode(".", $originalFileName);
        $fileExtension = strtolower(end($fileNameCmps));

        // Sanitize original filename for database storage (and create a unique name for the actual file)
        $safeOriginalFileName = preg_replace("/[^a-zA-Z0-9-_\.]/", "", basename($originalFileName));
        $uniqueNewFileName = uniqid('img_', true) . '.' . $fileExtension; // Create a unique name for the file on disk
        $destPath = $uploadDir . $uniqueNewFileName;

        $allowedfileExtensions = ['jpg', 'jpeg', 'gif', 'png', 'webp'];
        if (!in_array($fileExtension, $allowedfileExtensions)) {
            $response['message'] = 'Upload failed. Allowed file types: ' . implode(', ', $allowedfileExtensions);
        } elseif (move_uploaded_file($fileTmpPath, $destPath)) {
            $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName, $dbPort);

            if ($conn->connect_error) {
                $response['message'] = 'Database connection failed: ' . $conn->connect_error;
            } else {
                $imgUrl = $uploadUrlPath . $uniqueNewFileName; // Web-accessible URL

                $stmt = $conn->prepare("INSERT INTO images (filename, imgurl, size) VALUES (?, ?, ?)");
                if ($stmt) {
                    $stmt->bind_param("ssi", $safeOriginalFileName, $imgUrl, $fileSize);
                    if ($stmt->execute()) {
                        $response['status'] = 'success';
                        $response['message'] = 'Image uploaded and data saved successfully.';
                        $response['imageId'] = $stmt->insert_id;
                        $response['filename'] = $safeOriginalFileName;
                        $response['imgurl'] = $imgUrl;
                        $response['size'] = $fileSize;
                    } else {
                        $response['message'] = 'Database insert failed: ' . $stmt->error;
                    }
                    $stmt->close();
                } else {
                    $response['message'] = 'Database statement preparation failed: ' . $conn->error;
                }
                $conn->close();
            }
        } else {
            $response['message'] = 'Error moving uploaded file. Check server logs, directory permissions or PHP upload limits.';
        }
    } elseif (isset($_FILES['imageFile']['error'])) {
        // Provide more specific upload error messages
        $uploadErrors = [ /* ... (error codes mapped to messages, see previous thoughts) ... */ ];
        $response['message'] = 'File upload error code: ' . $_FILES['imageFile']['error']; // Simplified for brevity
    } else {
        $response['message'] = 'No file uploaded or file input name is incorrect (expected "imageFile").';
    }
} else {
    $response['message'] = 'Invalid request method. Only POST is accepted.';
}

echo json_encode($response);
?>