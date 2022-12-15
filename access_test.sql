-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2022-12-15 16:21:22
-- 伺服器版本： 10.4.20-MariaDB
-- PHP 版本： 8.0.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫: `access_test`
--

-- --------------------------------------------------------

--
-- 資料表結構 `bed_manage`
--

CREATE TABLE `bed_manage` (
  `id_number` varchar(255) NOT NULL,
  `bed_no` int(11) NOT NULL,
  `m_name` varchar(255) DEFAULT NULL,
  `p_condition` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `bed_manage`
--

INSERT INTO `bed_manage` (`id_number`, `bed_no`, `m_name`, `p_condition`) VALUES
('', 6, '', '空床'),
('D473890112', 4, '鍾秀楊', '休息中'),
('H382014573', 5, '黃勃融', '休息中'),
('K341256782', 7, '蔡昀吅', '在床中'),
('Q120987324', 1, '陳柏緊', '在床中'),
('R483909821', 8, '何輸瑋', '在床中'),
('S123456789', 2, '周松諭', '看診中'),
('W490382914', 3, '李政浩', '看診中');

-- --------------------------------------------------------

--
-- 資料表結構 `body_data`
--

CREATE TABLE `body_data` (
  `id_number` varchar(255) DEFAULT NULL,
  `m_date` varchar(255) NOT NULL,
  `T` double DEFAULT NULL,
  `m_name` varchar(255) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `body_data`
--

INSERT INTO `body_data` (`id_number`, `m_date`, `T`, `m_name`, `remark`) VALUES
('W490382914', '2022-12-14 ( 星期三)   16:34:39', 36.4, '李政浩', ''),
('W490382914', '2022-12-14 ( 星期三)   17:05:02', 45, '李政浩', '發燒'),
('W490382914', '2022-12-14 ( 星期三)   17:05:05', 34, '李政浩', ''),
('W490382914', '2022-12-14 ( 星期三)   17:05:11', 36.7, '李政浩', ''),
('W490382914', '2022-12-14 ( 星期三)   17:05:16', 36.5, '李政浩', ''),
('W490382914', '2022-12-15 ( 星期四)   10:55:28', 35, '李政浩', '不錯'),
('Q120987324', '2022-12-15 ( 星期四)   11:02:38', 36.4, '陳柏緊', '不錯'),
('R483909821', '2022-12-15 ( 星期四)   23:20:07', 34, '何輸瑋', '');

-- --------------------------------------------------------

--
-- 資料表結構 `data_change_text`
--

CREATE TABLE `data_change_text` (
  `id` int(11) NOT NULL,
  `record` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `data_change_text`
--

INSERT INTO `data_change_text` (`id`, `record`) VALUES
(1, '');

-- --------------------------------------------------------

--
-- 資料表結構 `esp_test`
--

CREATE TABLE `esp_test` (
  `id` int(11) NOT NULL,
  `member` varchar(255) NOT NULL,
  `temp` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `esp_test`
--

INSERT INTO `esp_test` (`id`, `member`, `temp`) VALUES
(144, '陳XX', '34.6'),
(145, '李XX', '38.6');

-- --------------------------------------------------------

--
-- 資料表結構 `med_time`
--

CREATE TABLE `med_time` (
  `id_number` varchar(255) DEFAULT NULL,
  `med` varchar(255) DEFAULT NULL,
  `m_date` varchar(255) NOT NULL,
  `m_name` varchar(255) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `med_time`
--

INSERT INTO `med_time` (`id_number`, `med`, `m_date`, `m_name`, `remark`) VALUES
('W490382914', 'FUROSELY TABLETS \"M.S.\"(高血壓)<br>SHIN TAN TABLETS \"SHOU CHAN\"(糖尿病)<br>', '2022-12-14 ( 星期三)   18:54:39', '李政浩', ''),
('W490382914', 'FURSEDE TABLETS(高血壓)<br>SHIN TAN TABLETS \"SHOU CHAN\"(糖尿病)<br>', '2022-12-15 ( 星期四)   10:55:39', '李政浩', ''),
('K341256782', 'FUROSELY TABLETS \"M.S.\"(高血壓)<br>SHIN TAN TABLETS \"SHOU CHAN\"(糖尿病)<br>', '2022-12-15 ( 星期四)   11:02:50', '蔡昀吅', ''),
('R483909821', 'FUROSELY TABLETS \"M.S.\"(高血壓)<br>SHIN TAN TABLETS \"SHOU CHAN\"(糖尿病)<br>', '2022-12-15 ( 星期四)   23:19:56', '何輸瑋', '');

-- --------------------------------------------------------

--
-- 資料表結構 `member`
--

CREATE TABLE `member` (
  `id_number` varchar(255) NOT NULL,
  `m_name` varchar(255) DEFAULT NULL,
  `permission` int(11) DEFAULT NULL,
  `identity` varchar(255) DEFAULT NULL,
  `userid` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `member`
--

INSERT INTO `member` (`id_number`, `m_name`, `permission`, `identity`, `userid`, `password`) VALUES
('D473890112', '鍾秀楊', 2, '病人', 'def456', 'def654'),
('F483901223', '徐溫詠', 1, '護理師', 'ghi456', 'ghi654'),
('F485739200', '江明諺', 1, '護理師', 'jeff01478', '123456'),
('H382014573', '黃勃融', 2, '病人', 'def123', 'def321'),
('K341256782', '蔡昀吅', 2, '病人', 'abc789', 'abc987'),
('Q120987324', '陳柏緊', 2, '病人', 'abc456', 'abc654'),
('R483909821', '何輸瑋', 2, '病人', 'ghi789', 'ghi987'),
('S123456789', '周松諭', 2, '病人', 'abc789', 'abc987'),
('W490382914', '李政浩', 2, '病人', 'abc123', 'abc321');

-- --------------------------------------------------------

--
-- 資料表結構 `patient_admission_info`
--

CREATE TABLE `patient_admission_info` (
  `id_number` varchar(255) NOT NULL,
  `ward_no` int(11) DEFAULT NULL,
  `r1` varchar(255) DEFAULT NULL,
  `bed_no` int(11) DEFAULT NULL,
  `r2` varchar(255) DEFAULT NULL,
  `phone_no` varchar(255) DEFAULT NULL,
  `r3` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `r4` varchar(255) DEFAULT NULL,
  `emergency_contact` varchar(255) DEFAULT NULL,
  `r5` varchar(255) DEFAULT NULL,
  `emergency_contact_no` varchar(255) DEFAULT NULL,
  `r6` varchar(255) DEFAULT NULL,
  `hospitalization_date` varchar(255) DEFAULT NULL,
  `r7` varchar(255) DEFAULT NULL,
  `observation_time` varchar(255) DEFAULT NULL,
  `r8` varchar(255) DEFAULT NULL,
  `attending_physician` varchar(255) DEFAULT NULL,
  `r9` varchar(255) DEFAULT NULL,
  `nurse` varchar(255) DEFAULT NULL,
  `r10` varchar(255) DEFAULT NULL,
  `current_condition` varchar(255) DEFAULT NULL,
  `r11` varchar(255) DEFAULT NULL,
  `transaction_info` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `patient_admission_info`
--

INSERT INTO `patient_admission_info` (`id_number`, `ward_no`, `r1`, `bed_no`, `r2`, `phone_no`, `r3`, `address`, `r4`, `emergency_contact`, `r5`, `emergency_contact_no`, `r6`, `hospitalization_date`, `r7`, `observation_time`, `r8`, `attending_physician`, `r9`, `nurse`, `r10`, `current_condition`, `r11`, `transaction_info`) VALUES
('D473890112', 712, '', 4, '', '0912384920', '', '新北市新店區安康路二段66號', '', '家人', '', '0921837491', '', '2020/03/16', '', '300', '', '江修黼', '', '徐溫詠', '', '', '', NULL),
('H382014573', 712, '', 5, '', '0921374820', '', '新北市新店區安康路二段67號', '', '家人', '', '0934827319', '', '2022/04/05', '', '300', '', '江修黼', '', '江明諺', '', '', '', NULL),
('K341256782', 712, '', 7, '', '0987234612', '', '新北市新店區安康路二段67號', '', '家人', '', '0923748129', '', '2020/4/5', '', '300', '', '江修黼', '', '江明諺', '', '', '', NULL),
('Q120987324', 712, '', 1, '', '0937482653', '', '台北市信義區中正路145號4樓之3', '', '家人', '', '0987346632', '', '2022/3/13', '', '500', '', '江修黼', '', '江明諺', '', 'not good', '', '無'),
('R483909821', 712, '', 8, '', '0923714829', '', '新北市新店區安康路二段69號', '', '家人', '', '0923871293', '', '2021/05/06', '', '300', '', '江修黼', '', '徐溫詠', '', '', '', NULL),
('S123456789', 712, '', 2, '', '0912733941', '', '新北市新店區安康路二段70號', '', '家人', '', '0937284923', '', '2022/12/09', '', '400', '', '江修黼', '', '徐溫詠', '', '', '', NULL),
('W490382914', 712, '', 3, '', '0912567889', '', '新北市新店區安康路二段67號', '', '家人', '', '0912345124', '', '2022/1/19', '', '150', '', '江修黼', '', '江明諺', '', 'good', '', 'ewgdb');

-- --------------------------------------------------------

--
-- 資料表結構 `patient_basic_info`
--

CREATE TABLE `patient_basic_info` (
  `id_number` varchar(255) NOT NULL,
  `r1` varchar(255) DEFAULT NULL,
  `chart_no` varchar(255) DEFAULT NULL,
  `r2` varchar(255) DEFAULT NULL,
  `m_name` varchar(255) DEFAULT NULL,
  `r3` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `r4` varchar(255) DEFAULT NULL,
  `birth_date` varchar(255) DEFAULT NULL,
  `r5` varchar(255) DEFAULT NULL,
  `blood` varchar(255) DEFAULT NULL,
  `r6` varchar(255) DEFAULT NULL,
  `rh` varchar(255) DEFAULT NULL,
  `r7` varchar(255) DEFAULT NULL,
  `major_illness` varchar(255) DEFAULT NULL,
  `r8` varchar(255) DEFAULT NULL,
  `allergies` varchar(255) DEFAULT NULL,
  `r9` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `patient_basic_info`
--

INSERT INTO `patient_basic_info` (`id_number`, `r1`, `chart_no`, `r2`, `m_name`, `r3`, `gender`, `r4`, `birth_date`, `r5`, `blood`, `r6`, `rh`, `r7`, `major_illness`, `r8`, `allergies`, `r9`) VALUES
('D473890112', NULL, '325324233', NULL, '鍾秀楊', NULL, '男性', NULL, '2001/03/05', NULL, 'A', NULL, 'RH+', NULL, '無', NULL, '無', NULL),
('H382014573', NULL, '362456142', NULL, '黃勃融', NULL, '男性', NULL, '2000/04/24', NULL, 'A', NULL, 'RH+', NULL, '無', NULL, '無', NULL),
('K341256782', NULL, '098346273', NULL, '蔡昀吅', NULL, '女性', NULL, '2001/08/30', NULL, 'O', NULL, 'RH+', NULL, '無', NULL, '無', NULL),
('Q120987324', NULL, '345625673', NULL, '陳柏緊', NULL, '女性', NULL, '1983/05/21', NULL, 'AB', NULL, 'RH+', NULL, '糖尿病', NULL, '無', NULL),
('R483909821', NULL, '038572483', NULL, '何輸瑋', NULL, '男性', NULL, '2002/4/5', NULL, 'B', NULL, 'RH+', NULL, '無', NULL, '無', NULL),
('S123456789', NULL, '049582738', NULL, '周松諭', NULL, '男性', NULL, '1999/12/3', NULL, 'AB', NULL, 'RH+', NULL, '無', NULL, '無', NULL),
('W490382914', '身分證號、護照號碼或居留證號', '123456345', NULL, '李政浩', NULL, '男性', NULL, '2001/08/13', '格式為西元YYYYMMDD', 'A', NULL, 'RH+', NULL, '無', NULL, '無', NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `responsible_nurse`
--

CREATE TABLE `responsible_nurse` (
  `id_number` varchar(255) NOT NULL,
  `m_name` varchar(255) DEFAULT NULL,
  `p1` varchar(255) DEFAULT NULL,
  `p2` varchar(255) DEFAULT NULL,
  `p3` varchar(255) DEFAULT NULL,
  `p4` varchar(255) DEFAULT NULL,
  `p1_id_number` varchar(10) DEFAULT NULL,
  `p2_id_number` varchar(10) DEFAULT NULL,
  `p3_id_number` varchar(10) DEFAULT NULL,
  `p4_id_number` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `responsible_nurse`
--

INSERT INTO `responsible_nurse` (`id_number`, `m_name`, `p1`, `p2`, `p3`, `p4`, `p1_id_number`, `p2_id_number`, `p3_id_number`, `p4_id_number`) VALUES
('F483901223', '徐溫詠', '何輸瑋', '周松諭', '鍾秀楊', NULL, 'R483909821', 'S123456789', 'D473890112', NULL),
('F485739200', '江明諺', '李政浩', '陳柏緊', '蔡昀吅', '黃勃融', 'W490382914', 'Q120987324', 'K341256782', 'H382014573');

-- --------------------------------------------------------

--
-- 資料表結構 `room_round_record`
--

CREATE TABLE `room_round_record` (
  `id_number` varchar(255) DEFAULT NULL,
  `m_date` varchar(255) NOT NULL,
  `content` varchar(255) DEFAULT NULL,
  `m_name` varchar(255) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `room_round_record`
--

INSERT INTO `room_round_record` (`id_number`, `m_date`, `content`, `m_name`, `remark`) VALUES
('W490382914', '2022-12-14 ( 星期三)   18:54:51', '量血壓<br>換藥<br>', '李政浩', ''),
('Q120987324', '2022-12-15 ( 星期四)   10:55:47', '換藥<br>', '陳柏緊', ''),
('H382014573', '2022-12-15 ( 星期四)   11:02:59', '量血壓<br>量體溫<br>', '黃勃融', ''),
('W490382914', '2022-12-15 ( 星期四)   13:37:31', '量血壓<br>量體溫<br>', '李政浩', ''),
('W490382914', '2022-12-15 ( 星期四)   13:37:41', '量血壓<br>', '李政浩', '過高'),
('S123456789', '2022-12-15 ( 星期四)   23:20:17', '換藥<br>', '周松諭', '');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `bed_manage`
--
ALTER TABLE `bed_manage`
  ADD PRIMARY KEY (`id_number`);

--
-- 資料表索引 `body_data`
--
ALTER TABLE `body_data`
  ADD PRIMARY KEY (`m_date`),
  ADD KEY `id_number` (`id_number`);

--
-- 資料表索引 `data_change_text`
--
ALTER TABLE `data_change_text`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `esp_test`
--
ALTER TABLE `esp_test`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `med_time`
--
ALTER TABLE `med_time`
  ADD PRIMARY KEY (`m_date`),
  ADD KEY `id_number` (`id_number`);

--
-- 資料表索引 `member`
--
ALTER TABLE `member`
  ADD PRIMARY KEY (`id_number`);

--
-- 資料表索引 `patient_admission_info`
--
ALTER TABLE `patient_admission_info`
  ADD PRIMARY KEY (`id_number`);

--
-- 資料表索引 `patient_basic_info`
--
ALTER TABLE `patient_basic_info`
  ADD PRIMARY KEY (`id_number`);

--
-- 資料表索引 `responsible_nurse`
--
ALTER TABLE `responsible_nurse`
  ADD PRIMARY KEY (`id_number`);

--
-- 資料表索引 `room_round_record`
--
ALTER TABLE `room_round_record`
  ADD PRIMARY KEY (`m_date`),
  ADD KEY `id_number` (`id_number`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `data_change_text`
--
ALTER TABLE `data_change_text`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `esp_test`
--
ALTER TABLE `esp_test`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=146;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `bed_manage`
--
ALTER TABLE `bed_manage`
  ADD CONSTRAINT `bed_manage_ibfk_1` FOREIGN KEY (`id_number`) REFERENCES `member` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `body_data`
--
ALTER TABLE `body_data`
  ADD CONSTRAINT `body_data_ibfk_1` FOREIGN KEY (`id_number`) REFERENCES `member` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `med_time`
--
ALTER TABLE `med_time`
  ADD CONSTRAINT `med_time_ibfk_1` FOREIGN KEY (`id_number`) REFERENCES `member` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `patient_admission_info`
--
ALTER TABLE `patient_admission_info`
  ADD CONSTRAINT `patient_admission_info_ibfk_1` FOREIGN KEY (`id_number`) REFERENCES `member` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `patient_basic_info`
--
ALTER TABLE `patient_basic_info`
  ADD CONSTRAINT `patient_basic_info_ibfk_1` FOREIGN KEY (`id_number`) REFERENCES `patient_admission_info` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `responsible_nurse`
--
ALTER TABLE `responsible_nurse`
  ADD CONSTRAINT `responsible_nurse_ibfk_1` FOREIGN KEY (`id_number`) REFERENCES `member` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `room_round_record`
--
ALTER TABLE `room_round_record`
  ADD CONSTRAINT `room_round_record_ibfk_1` FOREIGN KEY (`id_number`) REFERENCES `member` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
