/* 여기 써있는 표를 최우선 순위로 하여 전체 코드를 수정할 것
                        테이블 구조
                카테고리            주문      
              ┌────────┐         ┌─────┐    
     owner->store->categories->food->orders->payment_*
        └──────┘       └─────────┘     └───────┘     ||
         로그인             음식           결제        \/
                                                kiosk,table
                                               결제는 두군데로 나눔 html2개 필요 아니면
        table key값                             버튼으로 키오스크 결제/테이블 결제 선택
  sotres =  S.code/owner/O_id 
categories= store_id/stores/S.id   
      food= category_id/categories/id
    orders= store_id/stores/S.id
*/
const express = require('express');
const mysql = require('mysql2/promise');            
const methodOverride = require('method-override');  
const cors = require('cors');                       
const fs = require('fs');                           
const http = require('http'); 
const https = require('https');     
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');   
require('dotenv').config();         

const app = express();
const port = 22025;

const dbConfig = {
    host: '127.0.0.1', 
    user: 'root',      
    password: '1234', 
    database: 'test',  
    port: 3306,        
};

const JWT_SECRET = '0100110010010111010101';

const pool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    port: dbConfig.port,
    waitForConnections: true, 
    connectionLimit: 10,      
    queueLimit: 0             
});

async function testDbConnectionPool() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('MySQL 연결 풀 성공적으로 테스트되었습니다!');
    } catch (err) {
        console.error('MySQL 연결 풀 테스트 실패:', err);
        console.error('데이터베이스 설정(nn.js 파일 내 dbConfig)을 확인하거나 MySQL 서버가 실행 중인지 확인하세요.');
        process.exit(1); 
    } finally {
        if (connection) connection.release(); 
    }
}
testDbConnectionPool();


app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(methodOverride('_method')); 
app.use(express.static('public')); 

//인증 미들웨어 (정의만 유지하고, 로그인/계정 추가 외에는 사용하지 않음)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ status: 'error', message: '인증 토큰이 필요합니다.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT 검증 오류:', err.message);
            return res.status(403).json({ status: 'error', message: '유효하지 않은 토큰입니다.' });
        }
        req.user = user;
        next();
    });
}

// 이미지 프록시
app.get('/api/proxy-image', async (req, res) => {
    const imageUrl = req.query.url; 
    if (!imageUrl) {
        return res.status(400).send('Image URL is required.');
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(imageUrl);
    } catch (e) {
        return res.status(400).send('Invalid image URL provided.');
    }

    const fetchModule = parsedUrl.protocol === 'https:' ? https : http;

    let contentType = 'application/octet-stream';
    const path = parsedUrl.pathname.toLowerCase();
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
    } else if (path.endsWith('.png')) {
        contentType = 'image/png';
    } else if (path.endsWith('.gif')) {
        contentType = 'image/gif';
    } else if (path.endsWith('.svg')) {
        contentType = 'image/svg+xml';
    }

    try {
        await new Promise((resolve, reject) => {
            fetchModule.get(imageUrl, (proxyRes) => {
                res.writeHead(proxyRes.statusCode, { 'Content-Type': contentType });
                proxyRes.pipe(res); 
                proxyRes.on('end', resolve);
                proxyRes.on('error', reject);
            }).on('error', (err) => {
                reject(new Error(`Failed to fetch image: ${err.message}`));
            });
        });

    } catch (error) {
        console.error('이미지 프록시 오류:', error);
        if (!res.headersSent) {
            res.status(500).send('Failed to load image.');
        }
    }
});

// 로그인 (인증 유지)
app.post('/api/login', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { username, password } = req.body;

        const query = 'SELECT * FROM owner WHERE username = ?';
        const [results] = await connection.execute(query, [username]);

        if (results.length > 0) {
            const owner = results[0];
            const storeQuery = 'SELECT `S.id` FROM stores WHERE `S.code` = ?';
            const [storeResults] = await connection.execute(storeQuery, [owner.O_id]);
            
            const storeId = storeResults.length > 0 ? storeResults[0]['S.id'] : null;
            
            res.json({ 
                status: 'success', 
                message: '로그인 성공',
                owner_id: owner.O_id,
                store_id: storeId
            });
        } else {
            res.status(401).json({ status: 'error', message: '잘못된 사용자 이름 또는 비밀번호입니다.' });
        }
    } catch (err) {
        console.error('로그인 오류:', err);
        res.status(500).json({ status: 'error', message: '로그인 처리 중 오류가 발생했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 소유자 정보 불러오기
app.get('/api/owner', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const [results] = await connection.execute('SELECT * FROM owner');
        res.json({ status: 'success', data: results });
    } catch (err) {
        console.error('소유자 정보 불러오기 오류:', err);
        res.status(500).json({ status: 'error', message: '소유자 정보를 불러오는 데 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 계정 추가
app.post('/api/addaccount', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { username, password, email, cell_phone, binumber } = req.body;

        if (!username || !password || !email || !binumber) {
            return res.status(400).json({ status: 'error', message: '모든 필드가 필요합니다.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = 'INSERT INTO owner (username, password, email, cell_phone, binumber) VALUES (?, ?, ?, ?, ?)';
        await connection.execute(query, [username, hashedPassword, email, cell_phone || '', binumber]);

        res.json({ status: 'success', message: '계정 추가 완료' });
    } catch (err) {
        console.error('계정 추가 오류:', err);
        res.status(500).json({ status: 'error', message: '계정 추가에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 데이터베이스 초기화 스크립트 (비밀번호 해싱)
app.post('/api/migrate-passwords', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [owners] = await connection.execute('SELECT O_id, password FROM owner');
        
        for (const owner of owners) {
            if (!owner.password.startsWith('$2b$')) {
                const hashedPassword = await bcrypt.hash(owner.password, 10);
                await connection.execute('UPDATE owner SET password = ? WHERE O_id = ?', 
                    [hashedPassword, owner.O_id]);
            }
        }
        
        res.json({ status: 'success', message: '모든 비밀번호가 해싱되었습니다.' });
    } catch (err) {
        console.error('비밀번호 마이그레이션 오류:', err);
        res.status(500).json({ status: 'error', message: '마이그레이션 실패', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 계정 수정
app.post('/api/updateaccount/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { id } = req.params; 
        const { username, password, email, cell_phone, binumber } = req.body;

        const query = 'UPDATE owner SET username = ?, password = ?, email = ?, cell_phone = ?, binumber = ? WHERE O_id = ?';
        await connection.execute(query, [username, password, email, cell_phone || '', binumber, id]);

        res.json({ status: 'success', message: '계정 수정 완료' });
    } catch (err) {
        console.error('계정 수정 오류:', err);
        res.status(500).json({ status: 'error', message: '계정 수정에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 계정 삭제
app.delete('/api/deleteaccount/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { id } = req.params;
        const { password } = req.body; 

        const checkQuery = 'SELECT * FROM owner WHERE O_id = ? AND password = ?';
        const [results] = await connection.execute(checkQuery, [id, password]);

        if (results.length === 0) {
            return res.status(401).json({ status: 'error', message: '잘못된 비밀번호입니다.' });
        }

        const deleteQuery = 'DELETE FROM owner WHERE O_id = ?';
        await connection.execute(deleteQuery, [id]);

        res.json({ status: 'success', message: '계정 삭제 완료' });
    } catch (err) {
        console.error('계정 삭제 오류:', err);
        res.status(500).json({ status: 'error', message: '계정 삭제에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 매장 불러오기
app.get('/api/stores', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const [results] = await connection.execute('SELECT * FROM stores');
        res.json({ data: results });
    } catch (err) {
        console.error('매장 불러오기 오류:', err);
        res.status(500).json({ message: '매장 목록을 불러오는 데 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 매장 추가
app.post('/api/addstore', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { name, shop_name, cell_phone, binumber, 'S.code': S_code } = req.body;

        if (!name || !shop_name || !cell_phone || !binumber) {
            return res.status(400).json({ status: 'error', message: '모든 필드가 필요합니다.' });
        }

        const query = 'INSERT INTO stores (`S.code`, name, shop_name, cell_phone, binumber) VALUES (?, ?, ?, ?, ?)';
        await connection.execute(query, [S_code || 1, name, shop_name, cell_phone, binumber]);
        res.json({ status: 'success', message: '매장 추가 완료' });
    } catch (err) {
        console.error('매장 추가 오류:', err);
        res.status(500).json({ status: 'error', message: '매장 추가에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 매장 수정
app.post('/api/updatestore/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { id } = req.params; 
        const { name, shop_name, cell_phone } = req.body;

        const query = 'UPDATE stores SET name = ?, shop_name = ?, cell_phone = ? WHERE `S.id` = ?';
        await connection.execute(query, [name, shop_name, cell_phone, id]);

        res.json({ status: 'success', message: '매장 수정 완료' });
    } catch (err) {
        console.error('매장 수정 오류:', err);
        res.status(500).json({ status: 'error', message: '매장 수정에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 카테고리 불러오기
app.get('/api/categories/:store_id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { store_id } = req.params;
        const [results] = await connection.execute('SELECT * FROM categories WHERE store_id = ? AND `use` = "Y"', [store_id]); 
        res.json({ data: results });
    } catch (err) {
        console.error('카테고리 불러오기 오류:', err);
        res.status(500).json({ status: 'error', message: '카테고리 목록을 불러오는 데 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 카테고리 추가
app.post('/api/addcategory', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { store_id, name } = req.body;

        if (!store_id || !name) {
            return res.status(400).json({ status: 'error', message: '모든 필드가 필요합니다.' });
        }

        const query = 'INSERT INTO categories (store_id, name, `use`) VALUES (?, ?, "Y")';
        await connection.execute(query, [store_id, name]);
        res.json({ status: 'success', message: '카테고리 추가 완료' });
    } catch (err) {
        console.error('카테고리 추가 오류:', err);
        res.status(500).json({ status: 'error', message: '카테고리 추가에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 카테고리 수정
app.post('/api/updatecategory/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { id } = req.params;
        const { name } = req.body;

        const query = 'UPDATE categories SET name = ? WHERE id = ?';
        await connection.execute(query, [name, id]);
        res.json({ status: 'success', message: '카테고리 수정 완료' });
    } catch (err) {
        console.error('카테고리 수정 오류:', err);
        res.status(500).json({ status: 'error', message: '카테고리 수정에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 카테고리 삭제
app.delete('/api/deletecategory/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const query = 'DELETE FROM categories WHERE id = ?';
        const [result] = await connection.execute(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: '카테고리를 찾을 수 없습니다.' });
        }
        res.json({ status: 'success', message: '카테고리 삭제 완료' });
    } catch (err) {
        console.error('카테고리 삭제 오류:', err);
        res.status(500).json({ status: 'error', message: '카테고리 삭제 오류', error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 메뉴 항목 불러오기
app.get('/api/food/:category_id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { category_id } = req.params;
        const [results] = await connection.execute('SELECT * FROM food WHERE category_id = ? AND `use` = "Y"', [category_id]);
        res.json({ data: results });
    } catch (err) {
        console.error('메뉴 항목 불러오기 오류:', err);
        res.status(500).json({ message: '메뉴 항목을 불러오는 데 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 음식 추가
app.post('/api/addfood', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { category_id, name, description, price, images_url } = req.body;

        if (!category_id || !name || !price) {
            return res.status(400).json({ status: 'error', message: '필수 필드가 누락되었습니다.' });
        }

        const query = 'INSERT INTO food (category_id, name, description, price, images_url, `use`) VALUES (?, ?, ?, ?, ?, "Y")';
        await connection.execute(query, [category_id, name, description || '', price, images_url || '']);
        res.json({ status: 'success', message: '음식 추가 완료' });
    } catch (err) {
        console.error('음식 추가 오류:', err);
        res.status(500).json({ status: 'error', message: '음식 추가에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 음식 수정
app.post('/api/updatefood/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { id } = req.params;
        const { name, category_id, description, price, images_url } = req.body;

        const query = 'UPDATE food SET name = ?, category_id = ?, description = ?, price = ?, images_url = ? WHERE id = ?';
        await connection.execute(query, [name, category_id, description || '', price, images_url || '', id]);
        res.json({ status: 'success', message: '음식 수정 완료' });
    } catch (err) {
        console.error('음식 수정 오류:', err);
        res.status(500).json({ status: 'error', message: '음식 수정에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 음식 사용 여부 변경
app.post('/api/usefood/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { id } = req.params;
        const { use } = req.body;

        if (!['Y', 'N'].includes(use)) {
            return res.status(400).json({ status: 'error', message: 'use 값은 Y 또는 N이어야 합니다.' });
        }

        const query = 'UPDATE food SET `use` = ? WHERE id = ?';
        await connection.execute(query, [use, id]);
        res.json({ status: 'success', message: '음식 상태 변경 완료' });
    } catch (err) {
        console.error('음식 상태 변경 오류:', err);
        res.status(500).json({ status: 'error', message: '음식 상태 변경에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 음식 삭제
app.delete('/api/deletefood/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const query = 'DELETE FROM food WHERE id = ?';
        const [result] = await connection.execute(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: '음식을 찾을 수 없습니다.' });
        }
        res.json({ status: 'success', message: '음식 삭제 완료' });
    } catch (err) {
        console.error('음식 삭제 오류:', err);
        res.status(500).json({ status: 'error', message: '음식 삭제 오류', error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 주문 추가
app.post('/api/addorder', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { store_id, food_name, common_options, custom_option, quantity, price, serviceType } = req.body;

        if (!store_id || !food_name || !quantity || !price) {
            return res.status(400).json({ status: 'error', message: '필수 필드가 누락되었습니다.' });
        }

        const query = 'INSERT INTO orders (store_id, food_name, common_options, custom_option, quantity, price, ServiceType, status) VALUES (?, ?, ?, ?, ?, ?, ?, "주문 접수")';
                                                                /*기본 옵션 달게   음료별 옵션       수량            매장/포장
                                                            추가안함으로 기본옵션     샷추가                         배달 포장 등
                                                        옵션은 개인의 선택          얼을 적게
                                            휘핑추가등 기본 옵션은 버튼으로 선택   빨대 없이 등 사용자가 추가하는 버튼 형식     */
        await connection.execute(query, [store_id, food_name, common_options || '', custom_option || '', quantity, price, serviceType || '키오스크']);

        res.json({ status: 'success', message: '주문 추가 완료' });
    } catch (err) {
        console.error('주문 추가 오류:', err);
        res.status(500).json({ status: 'error', message: '주문 추가에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 주문 목록 불러오기
app.get('/api/orderlist', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const storeId = req.query.store_id;

        let query, params;
        if (storeId) {
            query = 'SELECT * FROM orders WHERE store_id = ? ORDER BY order_time DESC';
            params = [storeId];
        } else {
            query = 'SELECT * FROM orders ORDER BY order_time DESC';
            params = [];
        }

        const [results] = await connection.execute(query, params);
        res.json({ status: 'success', data: results });
    } catch (err) {
        console.error('주문 목록 불러오기 오류:', err);
        res.status(500).json({ status: 'error', message: '주문 목록을 불러오는 데 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});
 
// 주문 상태 업데이트
app.post('/api/updateorder/:order_id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { order_id } = req.params; 
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ status: 'error', message: 'status 필드가 필요합니다.' });
        }

        const query = 'UPDATE orders SET status = ? WHERE order_id = ?';
                        /*status는 "주문 접수", "주문 준비 중", "완료", "배달 중", "배달 완료", "주문 취소"
                        status는 주문 접수를 누르면 주문 준비 중 -> 완료 -> 배달 중 -> 배달 완료
                    배달 말고 kiosk 매장에서는 주문 접수 -> 주문 준비 중 -> 완료 지금은 다 kiosk 매장으로 설정  */
        await connection.execute(query, [status, order_id]);

        res.json({ status: 'success', message: `주문 상태를 '${status}'로 변경했습니다.` });
    } catch (err) {
        console.error('주문 상태 업데이트 오류:', err);
        res.status(500).json({ status: 'error', message: '주문 상태 업데이트에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 기기 불러오기
app.get('/api/devices', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const [results] = await connection.execute('SELECT * FROM devices');
        res.json({ status: 'success', data: results });
    } catch (err) {
        console.error('기기 불러오기 오류:', err);
        res.status(500).json({ status: 'error', message: '기기 목록을 불러오는 데 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 기기 추가
app.post('/api/adddevice', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { dev_id, dev_name, dev_type, dev_status, dev_location, dev_description } = req.body;

        if (!dev_id || !dev_name || !dev_type || !dev_status) {
            return res.status(400).json({ status: 'error', message: '필수 필드가 누락되었습니다.' });
        }

        const query = 'INSERT INTO devices (dev_id, dev_name, dev_type, dev_status, dev_location, dev_description) VALUES (?, ?, ?, ?, ?, ?)';
        await connection.execute(query, [dev_id, dev_name, dev_type, dev_status, dev_location || '', dev_description || '']);
        res.json({ status: 'success', message: '기기 추가 완료' });
    } catch (err) {
        console.error('기기 추가 오류:', err);
        res.status(500).json({ status: 'error', message: '기기 추가에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 기기 온라인 처리
app.post('/api/turnondevice/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { id } = req.params;
        const query = 'UPDATE devices SET dev_status = "online" WHERE id = ?';
        await connection.execute(query, [id]);
        res.json({ status: 'success', message: '기기가 온라인으로 변경되었습니다.' });
    } catch (err) {
        console.error('기기 상태 변경 오류:', err);
        res.status(500).json({ status: 'error', message: '기기 상태 변경에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 기기 오프라인 처리
app.post('/api/offlinedevice/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { id } = req.params;
        const query = 'UPDATE devices SET dev_status = "offline" WHERE id = ?';
        await connection.execute(query, [id]);
        res.json({ status: 'success', message: '기기가 오프라인으로 변경되었습니다.' });
    } catch (err) {
        console.error('기기 상태 변경 오류:', err);
        res.status(500).json({ status: 'error', message: '기기 상태 변경에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 기기 삭제
app.delete('/api/deletedevice/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const query = 'DELETE FROM devices WHERE id = ?';
        const [result] = await connection.execute(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: '기기를 찾을 수 없습니다.' });
        }
        res.json({ status: 'success', message: '기기 삭제 완료' });
    } catch (err) {
        console.error('기기 삭제 오류:', err);
        res.status(500).json({ status: 'error', message: '기기 삭제 오류', error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 추천 메뉴 불러오기
app.get('/api/recommend/:store_id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { store_id } = req.params;
        const query = `
            SELECT food_name, COUNT(*) AS order_count
            FROM orders
            WHERE store_id = ?
            GROUP BY food_name
            ORDER BY order_count DESC
            LIMIT 3
        `;
        const [results] = await connection.execute(query, [store_id]);
        res.json({ status: 'success', data: results });
    } catch (err) {
        console.error('추천 메뉴 불러오기 오류:', err);
        res.status(500).json({ status: 'error', message: '추천 메뉴를 불러오는 데 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// 할인 목록 불러오기
app.get('/api/discounts', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [discounts] = await connection.execute('SELECT id, amount FROM discount');
        const formattedDiscounts = discounts.map(d => ({
            id: d.id,
            amount: d.amount,
            name: `할인율 ${(d.amount * 100).toFixed(0)}%`
        }));
        res.json({ status: 'success', data: formattedDiscounts });
    } catch (err) {
        console.error('할인 목록 조회 오류:', err);
        res.status(500).json({ status: 'error', message: '할인 목록을 가져오는 데 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 할인 적용
app.post('/api/discount', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { order_id, discount_id } = req.body;

        if (!order_id || !discount_id) {
            return res.status(400).json({ status: 'error', message: '주문 ID와 할인 ID가 모두 필요합니다.' });
        }

        const [orderRows] = await connection.execute('SELECT price FROM orders WHERE order_id = ?', [order_id]);

        if (orderRows.length === 0) {
            return res.status(404).json({ status: 'error', message: '해당 주문을 찾을 수 없습니다.' });
        }

        const [discountRows] = await connection.execute('SELECT amount FROM discount WHERE id = ?', [discount_id]);
        if (discountRows.length === 0) {
            return res.status(404).json({ status: 'error', message: '적용할 할인 정보를 찾을 수 없습니다.' });
        }

        const originalPrice = orderRows[0].price;
        const discountRate = discountRows[0].amount;
        const discountAmount = Math.floor(originalPrice * discountRate);
        const discountedPrice = originalPrice - discountAmount;

        res.json({
            status: 'success',
            originalPrice,
            discountAmount,
            discountedPrice
        });
    } catch (err) {
        console.error('할인 적용 오류:', err);
        res.status(500).json({ status: 'error', message: '할인 적용에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

//결제
app.post('/api/payorder_table/:order_id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { order_id } = req.params; 
        const { paymentMethod } = req.body;

        if (!paymentMethod) {
            return res.status(400).json({ status: 'error', message: '결제 방법이 필요합니다.' });
        }

        const insertPaymentQuery = 'INSERT INTO payment_table (order_id, payment_method, status) VALUES (?, ?, ?)';
        await connection.execute(insertPaymentQuery, [order_id, paymentMethod, '결제 완료']);

        const updateOrderQuery = 'UPDATE orders SET status = "결제 완료" WHERE order_id = ?';
        await connection.execute(updateOrderQuery, [order_id]);

        res.json({ status: 'success', message: '결제 완료' });
    } catch (err) {
        console.error('결제 오류:', err);
        res.status(500).json({ status: 'error', message: '결제 처리에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

//결제 불러오기 사용하는 DB는 payment_table 
app.get('/api/payment_table/:order_id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { order_id } = req.params; 

        const query = 'SELECT * FROM payment_table WHERE order_id = ?';
        const [results] = await connection.execute(query, [order_id]);

        if (results.length > 0) {
            res.json({ status: 'success', data: results[0] });
        } else {
            res.status(404).json({ status: 'error', message: '결제 정보가 없습니다.' });
        }
    } catch (err) {
        console.error('결제 정보 불러오기 오류:', err);
        res.status(500).json({ status: 'error', message: '결제 정보를 불러오는 데 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

//결제 사용하는 DB는 payment_kiosk kiosk.html
app.post('/api/payorder_kiosk/:order_id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { order_id } = req.params; 
        const { paymentMethod } = req.body;

        if (!paymentMethod) {
            return res.status(400).json({ status: 'error', message: '결제 방법이 필요합니다.' });
        }

        const insertPaymentQuery = 'INSERT INTO payment_kiosk (order_id, payment_method, status) VALUES (?, ?, ?)';
        await connection.execute(insertPaymentQuery, [order_id, paymentMethod, '결제 완료']);

        const updateOrderQuery = 'UPDATE orders SET status = "결제 완료" WHERE order_id = ?';
        await connection.execute(updateOrderQuery, [order_id]);

        res.json({ status: 'success', message: '결제 완료' });
    } catch (err) {
        console.error('결제 오류:', err);
        res.status(500).json({ status: 'error', message: '결제 처리에 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

//결제 불러오기 사용하는 DB는 payment_kiosk
app.get('/api/payment_kiosk/:order_id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        const { order_id } = req.params; 

        const query = 'SELECT * FROM payment_kiosk WHERE order_id = ?';
        const [results] = await connection.execute(query, [order_id]);

        if (results.length > 0) {
            res.json({ status: 'success', data: results[0] });
        } else {
            res.status(404).json({ status: 'error', message: '결제 정보가 없습니다.' });
        }
    } catch (err) {
        console.error('결제 정보 불러오기 오류:', err);
        res.status(500).json({ status: 'error', message: '결제 정보를 불러오는 데 실패했습니다.', error: err.message });
    } finally {
        if (connection) connection.release(); 
    }
});

// ==================== DB 덤프 ====================
app.get('/api/dump', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 

        const tables = ['owner', 'stores', 'devices', 'categories', 'food', 'orders', 'payment_table', 'payment_kiosk', 'discount', 'payment_total'];
        const result = {};

        for (const table of tables) {
            const [rows] = await connection.execute(`SELECT * FROM ${table}`);
            result[table] = rows;
        }

        fs.writeFileSync('DB.json', JSON.stringify(result, null, 2), 'utf8');

        res.json({ status: 'success', data: result, message: 'DB 데이터가 DB.json 파일로 성공적으로 덤프되었습니다.' });
    } catch (err) {
        console.error('DB JSON 덤프 중 오류 발생:', err);
        res.status(500).json({ status: 'error', message: 'DB JSON 덤프에 실패했습니다.', error: err.message });
    } finally {
        if (connection) {
            connection.release(); 
        }
    }
});

app.get('/', (req, res) => {
    res.send('서버가 실행 중입니다. API 엔드포인트를 사용하세요.');
});
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
