-- 테이블 생성: access_logs
CREATE TABLE `access_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(45) NOT NULL,
  `method` varchar(10) NOT NULL,
  `url` varchar(255) NOT NULL,
  `accessed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 테이블 생성: blocked_ip_history
CREATE TABLE `blocked_ip_history` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(45) NOT NULL,
  `blocked_until` timestamp NOT NULL,
  `reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `unblocked_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=240 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- blocked_ip_history 데이터 삽입
INSERT INTO `blocked_ip_history` VALUES ('19', '59.8.0.188', 'Fri Dec 13 2024 10:53:34 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Fri Dec 13 2024 09:53:33 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 09:58:33 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('20', '59.8.0.188', 'Fri Dec 13 2024 11:06:45 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Fri Dec 13 2024 10:06:45 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 10:50:09 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('21', '59.8.0.188', 'Fri Dec 13 2024 11:50:40 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Fri Dec 13 2024 10:50:40 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 10:52:28 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('22', '59.8.0.188', 'Fri Dec 13 2024 11:52:29 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Fri Dec 13 2024 10:52:29 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 10:54:02 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('24', '59.8.0.188', 'Fri Dec 13 2024 12:09:35 GMT+0900 (대한민국 표준시)', '관리자 차단 기능 확인용차단 (테스트)', 'Fri Dec 13 2024 11:09:35 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 11:09:49 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('25', '59.8.0.188', 'Fri Dec 13 2024 12:29:43 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Fri Dec 13 2024 11:29:42 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 11:31:02 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('26', '59.8.0.188', 'Fri Dec 13 2024 12:29:43 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Fri Dec 13 2024 11:29:42 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 11:31:02 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('27', '59.8.0.188', 'Fri Dec 13 2024 12:31:44 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Fri Dec 13 2024 11:31:44 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 11:41:29 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('28', '59.8.0.188', 'Fri Dec 13 2024 12:51:59 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Fri Dec 13 2024 11:51:58 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 11:52:03 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('29', '59.8.0.188', 'Fri Dec 13 2024 13:21:36 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Fri Dec 13 2024 12:21:35 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 12:21:53 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('30', '59.8.0.188', 'Fri Dec 13 2024 13:21:58 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Fri Dec 13 2024 12:21:58 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 12:25:09 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('31', '59.8.0.188', 'Fri Dec 13 2024 13:25:00 GMT+0900 (대한민국 표준시)', 'ㄴㅁㅇㅁㄴㅇㅁㄴㅇ', 'Fri Dec 13 2024 12:24:59 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 12:25:09 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('32', '59.8.0.188', 'Fri Dec 13 2024 13:26:05 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Fri Dec 13 2024 12:26:05 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 12:26:18 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('33', '59.8.0.188', 'Fri Dec 13 2024 13:26:20 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Fri Dec 13 2024 12:26:20 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 12:28:12 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('36', '59.8.0.188', 'Fri Dec 13 2024 13:28:21 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Fri Dec 13 2024 12:28:20 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 12:30:51 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('37', '59.8.0.188', 'Fri Dec 13 2024 13:32:33 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Fri Dec 13 2024 12:32:33 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 12:36:00 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('38', '59.8.0.188', 'Fri Dec 13 2024 13:39:24 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Fri Dec 13 2024 12:39:23 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 12:40:14 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('39', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('40', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('41', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('42', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('43', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('44', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('45', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('46', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('47', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('48', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('49', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('50', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('51', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('52', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('53', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('54', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('55', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('56', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('57', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('58', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('59', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('60', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('61', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('62', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('63', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('64', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('65', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('66', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('67', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('68', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('69', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('70', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('71', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('72', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('73', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('74', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('75', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('76', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('77', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('78', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('79', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('80', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('81', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('82', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('83', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('84', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('85', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('86', '59.8.0.188', 'Sat Dec 14 2024 12:32:38 GMT+0900 (대한민국 표준시)', '요청 초과', 'Sat Dec 14 2024 11:32:38 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:01:55 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('89', '119.207.53.140', 'Sat Dec 14 2024 13:02:02 GMT+0900 (대한민국 표준시)', '차단
', 'Sat Dec 14 2024 12:02:02 GMT+0900 (대한민국 표준시)', NULL);
INSERT INTO `blocked_ip_history` VALUES ('90', '59.8.0.188', 'Sat Dec 14 2024 13:02:22 GMT+0900 (대한민국 표준시)', 'ㄴㅁㅇㅁㄴㅇㅁㄴㅇ', 'Sat Dec 14 2024 12:02:21 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:13:49 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('91', '::1', 'Sat Dec 14 2024 13:03:05 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:03:05 GMT+0900 (대한민국 표준시)', NULL);
INSERT INTO `blocked_ip_history` VALUES ('92', '::1', 'Sat Dec 14 2024 13:03:29 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:03:29 GMT+0900 (대한민국 표준시)', NULL);
INSERT INTO `blocked_ip_history` VALUES ('93', '59.8.0.188', 'Sat Dec 14 2024 13:13:18 GMT+0900 (대한민국 표준시)', 'ㄴㅁㅇㅁㄴㅇㅁㄴㅇ', 'Sat Dec 14 2024 12:13:17 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:13:49 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('94', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('95', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('96', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('97', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('98', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('99', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('100', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('101', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('102', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('103', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('104', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('105', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('106', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('107', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('108', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('109', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('110', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('111', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('112', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('113', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('114', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('115', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('116', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('117', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('118', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('119', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('120', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('121', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('122', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('123', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('124', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('125', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('126', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('127', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('128', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('129', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('130', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('131', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('132', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('133', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('134', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('135', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('136', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('137', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('138', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('139', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('140', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('141', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('142', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('143', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('144', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('145', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('146', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('147', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('148', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('149', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('150', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('151', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('152', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('153', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('154', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('155', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('156', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('157', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('158', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('159', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('160', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('161', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('162', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('163', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('164', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('165', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('166', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('167', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('168', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('169', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('170', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('171', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('172', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('173', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('174', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('175', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('176', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('177', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('178', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('179', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('180', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('181', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('182', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('183', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('184', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('185', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('186', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('187', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('188', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('189', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('190', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('191', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('192', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('193', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('194', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('195', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('196', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('197', '59.8.0.188', 'Sat Dec 14 2024 13:13:51 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('198', '59.8.0.188', 'Sat Dec 14 2024 13:13:51 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('199', '59.8.0.188', 'Sat Dec 14 2024 13:13:50 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('200', '59.8.0.188', 'Sat Dec 14 2024 13:13:51 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('201', '59.8.0.188', 'Sat Dec 14 2024 13:13:51 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('202', '59.8.0.188', 'Sat Dec 14 2024 13:13:51 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('203', '59.8.0.188', 'Sat Dec 14 2024 13:13:51 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:13:51 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:14:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('204', '59.8.0.188', 'Sat Dec 14 2024 13:18:04 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:18:03 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:18:10 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('205', '59.8.0.188', 'Sat Dec 14 2024 13:18:49 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:18:49 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:19:04 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('206', '59.8.0.188', 'Sat Dec 14 2024 13:18:49 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:18:49 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:19:04 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('207', '59.8.0.188', 'Sat Dec 14 2024 13:18:49 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:18:49 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:19:04 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('208', '59.8.0.188', 'Sat Dec 14 2024 13:18:49 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:18:49 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:19:04 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('209', '59.8.0.188', 'Sat Dec 14 2024 13:19:05 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:19:05 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:19:12 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('210', '59.8.0.188', 'Sat Dec 14 2024 13:19:05 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:19:05 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:19:12 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('211', '59.8.0.188', 'Sat Dec 14 2024 13:19:05 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:19:05 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:19:12 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('212', '59.8.0.188', 'Sat Dec 14 2024 13:19:12 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:19:12 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:19:48 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('213', '59.8.0.188', 'Sat Dec 14 2024 13:19:12 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:19:12 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:19:48 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('214', '59.8.0.188', 'Sat Dec 14 2024 13:19:12 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:19:12 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:19:48 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('215', '59.8.0.188', 'Sat Dec 14 2024 13:54:10 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 12:54:09 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 12:54:15 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('216', '43.200.125.125', 'Sat Dec 14 2024 13:59:47 GMT+0900 (대한민국 표준시)', '과도한 요청	', 'Sat Dec 14 2024 12:59:46 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 13:02:54 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('217', '59.8.0.188', 'Sat Dec 14 2024 14:02:44 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 13:02:44 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 13:02:56 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('218', '59.8.0.188', 'Sat Dec 14 2024 14:03:04 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 13:03:03 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 13:27:20 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('219', '59.8.0.188', 'Sat Dec 14 2024 14:27:22 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 13:27:21 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 13:27:28 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('220', '59.8.0.188', 'Sat Dec 14 2024 15:52:30 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 14:52:29 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 14:52:46 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('221', '59.8.0.188', 'Sat Dec 14 2024 15:52:47 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 14:52:46 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 14:53:00 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('222', '59.8.0.188', 'Sat Dec 14 2024 15:53:02 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 14:53:01 GMT+0900 (대한민국 표준시)', 'Sat Dec 14 2024 14:54:09 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('223', '202.95.12.147', 'Sat Dec 14 2024 17:08:44 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 16:08:43 GMT+0900 (대한민국 표준시)', 'Mon Dec 16 2024 02:36:40 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('224', '101.66.172.251', 'Sun Dec 15 2024 00:48:43 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sat Dec 14 2024 23:48:42 GMT+0900 (대한민국 표준시)', 'Mon Dec 16 2024 02:36:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('225', '115.238.106.50', 'Sun Dec 15 2024 10:53:51 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Sun Dec 15 2024 09:53:50 GMT+0900 (대한민국 표준시)', 'Mon Dec 16 2024 02:36:39 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('226', '47.236.50.100', 'Mon Dec 16 2024 03:18:52 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Mon Dec 16 2024 02:18:51 GMT+0900 (대한민국 표준시)', 'Mon Dec 16 2024 02:36:38 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('227', '59.8.0.188', 'Mon Dec 16 2024 12:13:15 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Mon Dec 16 2024 11:13:14 GMT+0900 (대한민국 표준시)', 'Mon Dec 16 2024 11:13:29 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('228', '59.8.0.188', 'Mon Dec 16 2024 12:13:30 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Mon Dec 16 2024 11:13:30 GMT+0900 (대한민국 표준시)', 'Mon Dec 16 2024 11:13:41 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('229', '59.8.0.188', 'Mon Dec 16 2024 12:13:44 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Mon Dec 16 2024 11:13:44 GMT+0900 (대한민국 표준시)', 'Mon Dec 16 2024 11:14:08 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('230', '59.8.0.188', 'Mon Dec 16 2024 12:14:23 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Mon Dec 16 2024 11:14:23 GMT+0900 (대한민국 표준시)', 'Mon Dec 16 2024 11:14:37 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('231', '59.8.0.188', 'Mon Dec 16 2024 12:26:36 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Mon Dec 16 2024 11:26:36 GMT+0900 (대한민국 표준시)', 'Mon Dec 16 2024 11:26:56 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('232', '59.8.0.188', 'Mon Dec 16 2024 12:26:59 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Mon Dec 16 2024 11:27:01 GMT+0900 (대한민국 표준시)', 'Mon Dec 16 2024 11:27:05 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('233', '59.8.0.188', 'Mon Dec 16 2024 12:27:15 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Mon Dec 16 2024 11:27:16 GMT+0900 (대한민국 표준시)', 'Mon Dec 16 2024 11:27:19 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('234', '203.81.86.34', 'Mon Dec 16 2024 16:00:52 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Mon Dec 16 2024 15:00:51 GMT+0900 (대한민국 표준시)', 'Tue Dec 17 2024 19:47:32 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('235', '59.8.0.188', 'Tue Dec 17 2024 20:45:42 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Tue Dec 17 2024 19:45:41 GMT+0900 (대한민국 표준시)', 'Tue Dec 17 2024 19:47:31 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('236', '59.8.0.188', 'Tue Dec 17 2024 20:45:42 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Tue Dec 17 2024 19:45:41 GMT+0900 (대한민국 표준시)', 'Tue Dec 17 2024 19:47:31 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('237', '78.153.140.222', 'Wed Dec 18 2024 08:02:45 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Wed Dec 18 2024 07:02:45 GMT+0900 (대한민국 표준시)', NULL);
INSERT INTO `blocked_ip_history` VALUES ('238', '59.8.0.188', 'Wed Dec 18 2024 12:05:41 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Wed Dec 18 2024 11:05:40 GMT+0900 (대한민국 표준시)', 'Wed Dec 18 2024 11:06:29 GMT+0900 (대한민국 표준시)');
INSERT INTO `blocked_ip_history` VALUES ('239', '59.8.0.188', 'Wed Dec 18 2024 12:06:37 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Wed Dec 18 2024 11:06:36 GMT+0900 (대한민국 표준시)', 'Wed Dec 18 2024 11:13:12 GMT+0900 (대한민국 표준시)');


-- 테이블 생성: blocked_ips
CREATE TABLE `blocked_ips` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(45) NOT NULL,
  `blocked_until` timestamp NOT NULL,
  `reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=241 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- blocked_ips 데이터 삽입
INSERT INTO `blocked_ips` VALUES ('238', '78.153.140.222', 'Wed Dec 18 2024 08:02:45 GMT+0900 (대한민국 표준시)', '과도한 요청', 'Wed Dec 18 2024 07:02:45 GMT+0900 (대한민국 표준시)');


-- 테이블 생성: comments
CREATE TABLE `comments` (
  `comment_id` int unsigned NOT NULL AUTO_INCREMENT,
  `post_id` int unsigned NOT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `post_id` (`post_id`),
  KEY `fk_comments_user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comments_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4906 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- comments 데이터 삽입
INSERT INTO `comments` VALUES ('4887', '12', 'gmltnrsnsk', 'ㄴㅁㅇ', 'Tue Dec 10 2024 18:24:26 GMT+0900 (대한민국 표준시)', NULL);
INSERT INTO `comments` VALUES ('4905', '12', 'wxcve123', 'asdas', 'Sat Dec 14 2024 11:21:20 GMT+0900 (대한민국 표준시)', NULL);


-- 테이블 생성: messages
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 테이블 생성: pages
CREATE TABLE `pages` (
  `page_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`page_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 테이블 생성: posts
CREATE TABLE `posts` (
  `post_id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `likes_count` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `media_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_notice` tinyint(1) DEFAULT '0',
  `file_path` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tags` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `category` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`post_id`),
  KEY `posts_ibfk_1` (`user_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- posts 데이터 삽입
INSERT INTO `posts` VALUES ('12', 'wtrdd', '공지', '<p><strong>📜 게시판 기본 규칙</strong></p><h3>1. <strong>서로를 존중해주세요</strong></h3><ul><li>게시판은 모두가 함께 사용하는 공간입니다. 상대방을 비방하거나 모욕하는 행위는 금지합니다.</li></ul><blockquote><strong>관련 법령</strong>: 정보통신망 이용촉진 및 정보보호 등에 관한 법률 제44조의7(불법정보의 유통 금지 등)</blockquote><blockquote>"타인을 비방할 목적으로 공공연하게 사실 또는 허위의 정보를 유포해서는 안 됩니다."</blockquote><h3>2. <strong>적합한 게시물을 작성해주세요</strong></h3><ul><li>게시판 주제와 관련 없는 게시물, 광고, 스팸, 도배성 글은 삭제될 수 있습니다.</li><li>허위사실 유포나 타인의 명예를 훼손하는 글은 금지됩니다.</li></ul><blockquote><strong>관련 법령</strong>: 정보통신망 이용촉진 및 정보보호 등에 관한 법률 제70조(명예훼손 등)</blockquote><h3>3. <strong>개인정보를 보호해주세요</strong></h3><ul><li>본인 및 타인의 개인 전화번호, 주소, 계좌번호 등 민감한 정보를 게시하지 마세요.</li></ul><blockquote><strong>관련 법령</strong>: 개인정보 보호법 제17조(개인정보의 제공)</blockquote><blockquote>"타인의 개인정보를 무단으로 게시하거나 유포하는 행위는 법적 제재를 받을 수 있습니다."</blockquote><h3>4. <strong>저작권을 준수해주세요</strong></h3><ul><li>타인의 콘텐츠를 공유할 때는 반드시 출처를 명확히 기재하세요.</li><li>불법 복제물이나 저작권이 보호된 자료를 무단으로 게시하지 마세요.</li></ul><blockquote><strong>관련 법령</strong>: 저작권법 제136조(권리 침해에 대한 벌칙)</blockquote><blockquote>"저작권자의 허락 없이 저작물을 배포하거나 사용할 경우 법적 처벌을 받을 수 있습니다."</blockquote><h3>5. <strong>문의 및 신고</strong></h3><ul><li>문제가 발생하거나 궁금한 사항이 있다면 댓글을 통해 관리자(월덕)에게 문의하세요.</li><li>이메일<strong><u>: jungchwimisaenghwal63@gmail.com</u></strong></li></ul><h3>6. <strong>운영자의 판단에 따른 조치</strong></h3><ul><li>위 규칙 외에도 운영자가 게시판 질서를 위해 판단한 조치가 있을 수 있습니다.</li><li>운영자는 필요에 따라 사전 경고 없이 게시물을 삭제하거나 회원의 이용을 제한할 수 있습니다.</li></ul><blockquote><strong>관련 법령</strong>: 정보통신망 이용촉진 및 정보보호 등에 관한 법률 제44조의7(불법정보의 유통 금지 등)</blockquote><blockquote>"운영자는 불법정보나 규정 위반 게시물을 삭제할 권한이 있습니다."</blockquote><h3>추가 안내</h3><ul><li><strong>게시판 사용자는 본 규칙을 숙지하고 준수해야 합니다.</strong></li><li><strong>법령 위반 사항은 민형사상의 책임을 질 수 있으니 주의 바랍니다.</strong></li></ul><p><br></p>', '1', 'Mon Dec 09 2024 18:41:37 GMT+0900 (대한민국 표준시)', NULL, '1', NULL, NULL, NULL);
INSERT INTO `posts` VALUES ('22', 'wtrdd', '개인정보처리방침 공지 임시안을 공지합니다 ', '<h3>제1조 (개인정보의 처리 목적)</h3><p><strong>월덕게시판</strong>은 다음의 목적을 위해 개인정보를 처리합니다. 처리한 개인정보는 다음의 목적 이외의 용도로는 사용되지 않으며, 이용 목적이 변경될 경우에는 사전에 동의를 구할 예정입니다.</p><p><br></p><ol><li><strong>서비스 제공 및 관리</strong>: 회원가입, 게시판 이용, 콘텐츠 제공.</li><li><strong>고객 관리</strong>: 민원 처리, 공지사항 전달.</li><li><strong>보안 관리</strong>: 계정 도용 방지, 부정 이용 방지.</li></ol><h3>제2조 (처리 및 보유 기간)</h3><p><strong>월덕게시판</strong>은 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p><p><br></p><ol><li><strong>회원 가입 및 관리</strong>: 회원 탈퇴 시까지.</li><li><strong>게시물 및 댓글 관리</strong>: 게시물 삭제 요청 시까지 또는 서비스 종료 시까지.</li></ol><h3>제3조 (처리하는 개인정보의 항목)</h3><p><strong>월덕게시판</strong>은 다음과 같은 개인정보를 수집·이용하고 있습니다.</p><p><br></p><ol><li><strong>필수항목</strong>: 이름, 이메일, 사용자 ID, 비밀번호.</li><li><strong>선택항목</strong>: 프로필 사진, 생년월일.</li></ol><h3>제4조 (개인정보의 제3자 제공)</h3><p><strong>월덕게시판</strong>은 정보주체의 동의 없이 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우 예외로 합니다.</p><p><br></p><ol><li>법령에 따른 의무이행.</li><li>정보주체의 생명·신체·재산 보호를 위한 경우.</li></ol><h3>제5조 (개인정보 처리의 위탁)</h3><p><strong>월덕게시판</strong>은 개인정보 처리 업무를 외부 업체에 위탁하지 않습니다. 추후 위탁이 발생할 경우, 사전에 정보주체의 동의를 받겠습니다.</p><h3>제6조 (정보주체와 법정대리인의 권리·의무 및 행사방법)</h3><p>정보주체는 <strong>월덕게시판</strong>에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요청 등의 권리를 행사할 수 있습니다. 권리 행사는 서면, 전화, 이메일 등을 통해 가능합니다.</p><h3>제7조 (개인정보의 파기)</h3><p><strong>월덕게시판</strong>은 개인정보 보유기간의 경과, 처리 목적 달성 등으로 개인정보가 불필요하게 되었을 때, 지체 없이 해당 개인정보를 파기합니다.</p><p><br></p><ol><li><strong>파기 절차</strong>: 파기 사유가 발생한 개인정보를 선정 후 파기.</li><li><strong>파기 방법</strong>: 전자적 파일은 복구 불가능한 방법으로 삭제하며, 종이 문서는 분쇄기로 파기.</li></ol><h3>제8조 (개인정보의 안전성 확보 조치)</h3><p><strong>월덕게시판</strong>은 개인정보의 안전성을 확보하기 위해 다음과 같은 조치를 취하고 있습니다.</p><p><br></p><ol><li><strong>기술적 조치</strong>: 개인정보 접근권한 제한, 암호화.</li><li><strong>관리적 조치</strong>: 개인정보 처리자 교육, 내부 관리계획 수립.</li></ol><h3>제9조 (개인정보 보호책임자)</h3><p><strong>월덕게시판</strong>은 개인정보 처리에 관한 업무를 총괄하여 책임지고, 정보주체의 불만처리 및 피해구제를 위해 다음과 같이 개인정보 보호책임자를 지정하고 있습니다.</p><p><br></p><ul><li><strong>이름</strong>: 홍종환</li><li><strong>직책</strong>: 개인정보 보호책임자</li><li><strong>연락처</strong>: jungchwimisaenghwal63@gmail.com</li></ul><h3>제10조 (개인정보 처리방침 변경)</h3><p>이 개인정보 처리방침은 시행일로부터 적용되며, 변경사항이 있을 경우 공지사항을 통해 사전 공지합니다.</p><p><br></p><ul><li><strong>시행일</strong>: 2024년 9월 30일</li></ul><p><br></p>', '0', 'Wed Dec 11 2024 10:20:10 GMT+0900 (대한민국 표준시)', NULL, '1', NULL, NULL, NULL);
INSERT INTO `posts` VALUES ('24', 'wtrdd', 'dsf', '<p>sdf</p>', '0', 'Sat Dec 14 2024 09:14:49 GMT+0900 (대한민국 표준시)', NULL, '0', NULL, NULL, NULL);
INSERT INTO `posts` VALUES ('29', '52be3388-8389-4dd7-a3f5-0e3f7f331d87', 'asdas', '<p>dasdas</p>', '0', 'Wed Dec 18 2024 11:19:15 GMT+0900 (대한민국 표준시)', NULL, '0', NULL, NULL, NULL);
INSERT INTO `posts` VALUES ('30', '52be3388-8389-4dd7-a3f5-0e3f7f331d87', 'asd', '<p>asd</p>', '0', 'Wed Dec 18 2024 12:39:20 GMT+0900 (대한민국 표준시)', NULL, '0', NULL, 'das', '일상');


-- 테이블 생성: products
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- products 데이터 삽입
INSERT INTO `products` VALUES ('1', 'asd', NULL, '22333333.00', '0', 'Wed Dec 11 2024 19:41:53 GMT+0900 (대한민국 표준시)', 'Wed Dec 11 2024 19:41:53 GMT+0900 (대한민국 표준시)', 'Wed Dec 11 2024 10:41:53 GMT+0900 (대한민국 표준시)', 'Wed Dec 11 2024 10:41:53 GMT+0900 (대한민국 표준시)');
INSERT INTO `products` VALUES ('2', '재영', NULL, '1.00', '0', 'Fri Dec 13 2024 12:48:39 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 12:48:39 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 03:48:39 GMT+0900 (대한민국 표준시)', 'Fri Dec 13 2024 03:48:39 GMT+0900 (대한민국 표준시)');


-- 테이블 생성: purchases
CREATE TABLE `purchases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `buyer` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 테이블 생성: user
CREATE TABLE `user` (
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nickname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT '',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_login_time` datetime DEFAULT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'fixed_value',
  `role` enum('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'user',
  `kakao_id` bigint DEFAULT NULL COMMENT '카카오 사용자 고유 ID',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `kakao_id` (`kakao_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- user 데이터 삽입
INSERT INTO `user` VALUES ('52be3388-8389-4dd7-a3f5-0e3f7f331d87', '홍종환', '', 'as35186967@gmail.com', NULL, 'fixed_value', 'user', '3147454772');
INSERT INTO `user` VALUES ('alsxkr', 'alsxkr', '$2b$10$6TCi/dgypigC3iV0pr5e4u6p8QwjpEIJC7xHChq7pr1FaQvW/KVDa', 's01071240593@gmail.com', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWxzeGtyIiwiaWF0IjoxNzMzNzkxMzQ2LCJleHAiOjE3MzM3OTQ5NDZ9.3WkQ9ccSKKKLDBIRG3xMVAsA0hJhWAcyeaY2ZcGjYHs', NULL, NULL);
INSERT INTO `user` VALUES ('c2cbe1b5-93f1-4253-82b0-7e4662e65d20', '이준우', '', 'nui523431@gmail.com', NULL, 'fixed_value', 'user', '3838620179');
INSERT INTO `user` VALUES ('cvvv', 'ghdtkasjrnfl', '$2b$10$I.IEap91lC.S3L5VPQMc1.PK2xh0NEsuRJU8eiPSp9y3K1iFghZRW', NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiY3Z2diIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzMzODg0MzgzLCJleHAiOjE3MzM4ODc5ODN9.7R8WBcejFjmFuqVIK7FbYZMV92exro7FietDNPd_5oc', 'user', NULL);
INSERT INTO `user` VALUES ('dlgmltnr', 'dlgmltnr', '$2b$10$gXkxu5JNgNxQyHMmvS2l0u1O16BW0yiSzqv0lJwFHo0FXWehjFqNO', NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZGxnbWx0bnIiLCJpYXQiOjE3MzM3OTI0NDksImV4cCI6MTczMzc5NjA0OX0.kYlRhKbUB5KNBoG5zUDFA3y3F9g9zEQeP9Go_rhVLqo', NULL, NULL);
INSERT INTO `user` VALUES ('ewq', 'qwer', '$2b$10$YEOEKpvqFo/ZTyZXUIBsh.JYn3SXnkhGO3pduiZI3m3izXjDQsvje', NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZXdxIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MzM4ODQ0NjAsImV4cCI6MTczMzg4ODA2MH0.8upDLLsYysKlXxRxsr8em8S7fElavBuHaZcjKiQGivM', 'user', NULL);
INSERT INTO `user` VALUES ('gmltnrsnsk', 'gmltnrsnsk', '$2b$10$hDONxj3t4CJoZKNkyO2umePRfa8ba/Scvm11TyNeQ0K2cRSi2d9Yy', NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZ21sdG5yc25zayIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzMzNzk0MzM2LCJleHAiOjE3MzM3OTc5MzZ9.gAVp0NMnaIVMQ4_QZioFjtdmsw6knCsGA0ceEycVXp4', 'user', NULL);
INSERT INTO `user` VALUES ('jjjs', 'jjjs', '$2b$10$YkecZJpGLxsaWqvbnJfXfOJjDalanRr76Q3i21wcECZjMaJVMOlvq', NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiampqcyIsImlhdCI6MTczMTI4ODM4NSwiZXhwIjoxNzMxMjkxOTg1fQ.bphCHRv6uVU9ztDVRofTKRW1D3KP-ehG2hWsfMUhadw', 'user', NULL);
INSERT INTO `user` VALUES ('sjw9179', '라조기', '$2b$10$aKdwLzONTnOP4jTxdgSJYeakAfekIA7.O0lPVlGaqV/3P0P4BLSVm', NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoic2p3OTE3OSIsImlhdCI6MTczMzU0MzAwOSwiZXhwIjoxNzMzNTQ2NjA5fQ.IkMOIMpgKKxSHS5vq-2V5Mbg_P6gIgwo8RzmdqT6AkQ', 'user', NULL);
INSERT INTO `user` VALUES ('wtrdd', '월덕', '$2b$10$lj90jZCaNSHhu57JZRyQ1OstrpOW9h03dX6BptHd8.CTIAiC4YL9K', NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoid3RyZGQiLCJpYXQiOjE3MzEyODQwMDEsImV4cCI6MTczMTI4NzYwMX0.hQAyjB3hozYYB9ZEg8lRuLdUK75Mi85zn05XKNJ3XFY', 'admin', NULL);
INSERT INTO `user` VALUES ('wxcve123', '월덕', '$2b$10$2qvmTJ8IoaXYQ3bqaGdH7e5XtEd5TgoktzEFsQNsIMsYAnUFXALDW', NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoid3hjdmUxMjMiLCJpYXQiOjE3MzM1Mjk5NzAsImV4cCI6MTczMzUzMzU3MH0.GJfOS-RPc0OMLhjXVvI0EyPt_DACcC2HRt5bQ1Rindw', 'user', NULL);


-- 테이블 생성: users
CREATE TABLE `users` (
  `user_id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `isAdmin` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- 테이블 생성: whitelisted_ips
CREATE TABLE `whitelisted_ips` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(45) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ip_address` (`ip_address`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- whitelisted_ips 데이터 삽입
INSERT INTO `whitelisted_ips` VALUES ('3', '119.207.53.140', 'Sat Dec 14 2024 12:03:51 GMT+0900 (대한민국 표준시)');
INSERT INTO `whitelisted_ips` VALUES ('9', '34.64.82.73', 'Tue Dec 17 2024 19:38:34 GMT+0900 (대한민국 표준시)');
INSERT INTO `whitelisted_ips` VALUES ('10', '59.8.0.188', 'Wed Dec 18 2024 11:18:35 GMT+0900 (대한민국 표준시)');

