CREATE DATABASE  IF NOT EXISTS `test` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `test`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: test
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `use` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `fk_categories_store_id` FOREIGN KEY (`store_id`) REFERENCES `stores` (`S.id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,1,'음료','Y'),(2,1,'디저트','Y'),(3,2,'식사','Y'),(4,3,'버거','Y');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_categories`
--

DROP TABLE IF EXISTS `class_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `new_category_id` int NOT NULL,
  `store_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`new_category_id`),
  KEY `store_id` (`store_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_categories`
--

LOCK TABLES `class_categories` WRITE;
/*!40000 ALTER TABLE `class_categories` DISABLE KEYS */;
INSERT INTO `class_categories` VALUES (1,1,1,'커피'),(2,1,1,'라떼'),(3,1,1,'주스'),(4,2,1,'케이크'),(5,2,1,'쿠키'),(6,3,2,'소고기'),(7,4,3,'세트 버거'),(8,4,3,'단품 버거');
/*!40000 ALTER TABLE `class_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cm_infinity_categories`
--

DROP TABLE IF EXISTS `cm_infinity_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cm_infinity_categories` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `name` varchar(255) DEFAULT NULL,
  `C.categories_id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cm_infinity_categories`
--

LOCK TABLES `cm_infinity_categories` WRITE;
/*!40000 ALTER TABLE `cm_infinity_categories` DISABLE KEYS */;
INSERT INTO `cm_infinity_categories` VALUES (1,'커피',0),(2,'음료',0),(3,'디저트',0),(4,'뜨거운',1),(5,'차가운',1),(6,'버블티',2),(7,'주스',2),(8,'케잌',3),(9,'쿠키',3);
/*!40000 ALTER TABLE `cm_infinity_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dev_id` int NOT NULL,
  `dev_name` varchar(255) NOT NULL,
  `dev_type` varchar(50) NOT NULL,
  `dev_status` varchar(50) NOT NULL,
  `dev_location` varchar(255) NOT NULL,
  `dev_description` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dev_id` (`dev_id`),
  CONSTRAINT `loc` FOREIGN KEY (`dev_id`) REFERENCES `stores` (`S.id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
INSERT INTO `devices` VALUES (1,1,'coffee','kiosk','online','오전점',756894213),(2,2,'cow','table_order','offline','전지적 시점',987654321),(3,2,'cow','pos','online','전지적 시점',123456789),(4,1,'coffee','pos','online','오전점',135246987),(5,3,'ham','kiosk','online','평촌점',947291048),(6,3,'ham','pos','online','평촌점',249392753),(8,3,'ramen','kiosk','online','반점',128710283);
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discount`
--

DROP TABLE IF EXISTS `discount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discount` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discount`
--

LOCK TABLES `discount` WRITE;
/*!40000 ALTER TABLE `discount` DISABLE KEYS */;
INSERT INTO `discount` VALUES (1,0.25),(2,0.50),(3,0.20),(4,0.45);
/*!40000 ALTER TABLE `discount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `food`
--

DROP TABLE IF EXISTS `food`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `food` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` int NOT NULL,
  `images_url` varchar(8000) DEFAULT NULL,
  `use` varchar(255) NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `food_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `food`
--

LOCK TABLES `food` WRITE;
/*!40000 ALTER TABLE `food` DISABLE KEYS */;
INSERT INTO `food` VALUES (1,1,'아메리카노','아이스',2000,'https://media.istockphoto.com/id/469833895/ko/%EB%B9%84%EB%94%94%EC%98%A4/%EC%BB%A4%ED%94%BC-%EC%9B%90%EB%91%90-%EB%96%A8%EC%96%B4%EC%A7%80%EB%8A%94-%EC%98%A4%EB%B2%84-%EB%B0%B0%EA%B2%BD-super-%EB%8A%90%EB%A6%B0-%EB%8F%99%EC%9E%91.avif?s=640x640&k=20&c=btZRuj54V23qWvwKk3jS7S_g5lpFJECO1zoz76ljqbU=','Y',0.10),(2,1,'라떼','뜨거운',3000,'https://bitbucket.org/nextpayments/ws2025_api/raw/280c0b97138468414eebb1843648d46f8261f5ea/images/latte.jpg','Y',0.05),(3,2,'케이크','케잌인',3500,'https://media.istockphoto.com/id/1370520449/ko/%EC%82%AC%EC%A7%84/%EC%9C%A0%EC%95%BD%EC%9D%B4-%EC%9E%88%EB%8A%94-%EC%B4%88%EC%BD%9C%EB%A6%BF-%EC%BC%80%EC%9D%B4%ED%81%AC-%EC%A1%B0%EA%B0%81.jpg?s=612x612&w=0&k=20&c=kaQvVLSz8ZSz1uwTVcOR_v8E0buPPoCyDgsxdLLsv9c=','Y',0.03),(4,3,'소고기','비싼',27000,'https://bitbucket.org/nextpayments/ws2025_api/raw/280c0b97138468414eebb1843648d46f8261f5ea/images/cow.jpg','Y',NULL),(5,3,'바라밥','합리적인',3000,'https://bitbucket.org/nextpayments/ws2025_api/raw/280c0b97138468414eebb1843648d46f8261f5ea/images/rice.jpg','Y',NULL),(6,4,'치즈버거','단품 버거',4400,NULL,'Y',0.02),(7,4,'새우버거','세트 버거',8600,NULL,'Y',0.03),(8,2,'쿠키','쿠킼칩',2500,NULL,'Y',0.05),(9,2,'빵','빵',3500,'https://media.istockphoto.com/id/475263838/ko/%EC%82%AC%EC%A7%84/%EB%A7%8E%EC%9D%80-%ED%98%BC%ED%95%A9%EB%90%A8-%EB%B9%B5%EA%B3%BC-%EB%A1%A4%EC%9D%B4-%EC%8A%9B-%EC%9C%84%EC%97%90%EC%84%9C.jpg?s=612x612&w=0&k=20&c=TiLkU1GoBEFJG258AciybQ7LiAYCXAMmULOJucdl1RU=','Y',NULL),(10,1,'에스프레소',NULL,1700,NULL,'Y',NULL),(11,1,'라아떼',NULL,3333,NULL,'N',NULL);
/*!40000 ALTER TABLE `food` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `store_id` int DEFAULT NULL,
  `food_name` varchar(255) DEFAULT NULL,
  `common_options` varchar(255) DEFAULT NULL,
  `custom_option` varchar(255) DEFAULT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `ServiceType` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `order_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `discount_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`S.id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (4,1,'라떼','','',1,3000.00,'키오스크','주문 완료','2025-11-07 07:15:26',NULL),(5,1,'아메리카노','','',1,2000.00,'키오스크','주문 완료','2025-11-07 07:15:21',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `owner`
--

DROP TABLE IF EXISTS `owner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `owner` (
  `O_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `cell_phone` varchar(20) NOT NULL,
  `binumber` varchar(14) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`O_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `binumber` (`binumber`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owner`
--

LOCK TABLES `owner` WRITE;
/*!40000 ALTER TABLE `owner` DISABLE KEYS */;
INSERT INTO `owner` VALUES (1,'아무개','$2b$10$.V80L2iSPzWL3JnCWOSe/egKi//ExZhN4ghhMhSUW5nI3ZU7s8.4W','aaa@aaa.com','010-6452-4521','59873210548761','2025-06-19 08:44:36','2025-10-31 05:35:34'),(2,'김씨','$2b$10$liDVEA0PlzpIf38xulGy7.9Idmb62y.cSG1VxZDbydl./rQVYQ.56','alex@bbb.com','010-7352-9862','02548987315479','2025-07-03 05:09:09','2025-10-31 05:35:34'),(3,'박씨','$2b$10$vHpDwBhG/rtsUJ/ZPQdGMuvgB74oWEuvBnhfAgKBNLGfIjFoqh1QS','rtx@ggg.com','010-1060-3060','87543947563849','2025-07-03 05:15:53','2025-10-31 05:35:34'),(4,'안씨','$2b$10$5hpqV/rcmzZzTD3qVrq4T.D7iGsHXtuRUTS6JHf3UUvNyn.uxrsWy','doyoon@ddd.com','010-0000-0000','38746597281742','2025-07-04 08:58:53','2025-10-31 05:35:35'),(5,'이씨','$2b$10$uzajgcLD0pw8vcGaWxDtJO3x5Flhvk9ex5/7wCgw6ifr0ZvfJgCNu','sung@hhh.com','010-0000-0000','12345678912412','2025-11-07 08:15:02','2025-11-07 08:16:01');
/*!40000 ALTER TABLE `owner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_kiosk`
--

DROP TABLE IF EXISTS `payment_kiosk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_kiosk` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `order_id` int NOT NULL,
  `payment_method` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `payment_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `payment_kiosk_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_kiosk`
--

LOCK TABLES `payment_kiosk` WRITE;
/*!40000 ALTER TABLE `payment_kiosk` DISABLE KEYS */;
INSERT INTO `payment_kiosk` VALUES (7,4,'카드','결제 완료','2025-10-31 03:31:49',NULL);
/*!40000 ALTER TABLE `payment_kiosk` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_set_payment_kiosk_price` BEFORE INSERT ON `payment_kiosk` FOR EACH ROW BEGIN



    SELECT `price` * `quantity` INTO @order_total_price



    FROM `orders`



    WHERE `order_id` = NEW.order_id;
    SET NEW.price = @order_total_price;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `payment_table`
--

DROP TABLE IF EXISTS `payment_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_table` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `order_id` int NOT NULL,
  `payment_method` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `payment_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `payment_table_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_table`
--

LOCK TABLES `payment_table` WRITE;
/*!40000 ALTER TABLE `payment_table` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_table` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_set_payment_table_price` BEFORE INSERT ON `payment_table` FOR EACH ROW BEGIN



    SELECT `price` * `quantity` INTO @order_total_price



    FROM `orders`



    WHERE `order_id` = NEW.order_id;
    SET NEW.price = @order_total_price;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `payment_total`
--

DROP TABLE IF EXISTS `payment_total`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_total` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `order_id` int NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `payment_total_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_total`
--

LOCK TABLES `payment_total` WRITE;
/*!40000 ALTER TABLE `payment_total` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_total` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stores`
--

DROP TABLE IF EXISTS `stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stores` (
  `S.id` int NOT NULL AUTO_INCREMENT,
  `S.code` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `shop_name` varchar(255) NOT NULL,
  `cell_phone` varchar(255) NOT NULL,
  `binumber` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`S.id`),
  UNIQUE KEY `binumber` (`binumber`),
  KEY `S.code` (`S.code`),
  CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`S.code`) REFERENCES `owner` (`O_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stores`
--

LOCK TABLES `stores` WRITE;
/*!40000 ALTER TABLE `stores` DISABLE KEYS */;
INSERT INTO `stores` VALUES (1,1,'오전점','Ko-fi','010-6452-4521','59873210548761'),(2,2,'전지적 시점','black_cow','010-8472-7421','02548987315479'),(3,3,'평촌점','hambu','010-1060-3060','87543947563849'),(5,4,'반점','remen','010-6412-4521','98795412358745'),(6,4,'반의반점','re','010-6412-4521','=');
/*!40000 ALTER TABLE `stores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'test'
--

--
-- Dumping routines for database 'test'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-21 14:49:41
