-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2022-11-29 10:51:36
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
-- 資料庫: `bed_information_system`
--

-- --------------------------------------------------------

--
-- 資料表結構 `bed_manage`
--

CREATE TABLE `bed_manage` (
  `id_number` varchar(10) NOT NULL,
  `bed_no` text NOT NULL,
  `name` text DEFAULT NULL,
  `p_condition` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `bed_manage`
--

INSERT INTO `bed_manage` (`id_number`, `bed_no`, `name`, `p_condition`) VALUES
('1', '8', '李XX', '看診中'),
('2', '2', '陳XX', '在床中'),
('3', '3', '林XX', '在床中'),
('4', '5', '吳XX', '手術中'),
('5', '4', '何XX', '在床中'),
('6', '6', '呂XX', '看診中'),
('7', '7', '張XX', '手術中'),
('9', '1', NULL, '空床');

-- --------------------------------------------------------

--
-- 資料表結構 `body_data`
--

CREATE TABLE `body_data` (
  `id` int(11) NOT NULL,
  `date` text NOT NULL,
  `T` text NOT NULL,
  `name` text NOT NULL,
  `remark` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `body_data`
--

INSERT INTO `body_data` (`id`, `date`, `T`, `name`, `remark`) VALUES
(1, '2022-05-31 ( 星期二)   17:29:41', '36.4', '', ''),
(2, '2022-05-31 ( 星期二)   17:30:27', '36.4', '李XX', ''),
(3, '2022-05-31 ( 星期二)   17:37:22', '38.7', '李XX', '發燒'),
(4, '2022-05-31 ( 星期二)   17:37:35', '36.1', '李XX', ''),
(5, '2022-05-31 ( 星期二)   20:32:49', '45', '陳XX', '確診'),
(6, '2022-05-31 ( 星期二)   22:28:00', '45', '李XX', '123'),
(7, '2022-05-31 ( 星期二)   22:29:32', '34', '李XX', '456'),
(8, '2022-06-06 ( 星期一)   15:59:45', '38', '李XX', '123'),
(9, '2022-06-06 ( 星期一)   17:04:15', '36.4', '陳XX', '123'),
(10, '2022-06-07 ( 星期二)   09:12:36', '36.4', '陳XX', '678');

-- --------------------------------------------------------

--
-- 資料表結構 `data_change_text`
--

CREATE TABLE `data_change_text` (
  `id` int(11) NOT NULL,
  `text` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `data_change_text`
--

INSERT INTO `data_change_text` (`id`, `text`) VALUES
(1, '床號4(原病患陳XX)更換至床號，與病患何XX交換<br>床號1(原病患李XX)更換至床號8<br>床號8(原病患李XX)更換至床號1<br>床號1(原病患李XX)更換至床號8<br>床號4(原病患陳XX)更換至床號4，與病患陳XX交換<br>床號8(原病患李XX)更換至床號1<br>床號4(原病患陳XX)更換至床號4，與病患陳XX交換<br>床號2(原病患陳XX)更換至床號4，與病患何XX交換<br>床號1(原病患呂XX)更換至床號6<br>');

-- --------------------------------------------------------

--
-- 資料表結構 `med_time`
--

CREATE TABLE `med_time` (
  `id` int(11) NOT NULL,
  `med` text NOT NULL,
  `date` text NOT NULL,
  `name` text NOT NULL,
  `remark` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `med_time`
--

INSERT INTO `med_time` (`id`, `med`, `date`, `name`, `remark`) VALUES
(17, 'SHIN TAN TABLETS \"SHOU CHAN\"(糖尿病)<br>', '2022-05-31 ( 星期二)   17:09:32', '李XX', ''),
(18, 'FURSEDE TABLETS(高血壓)<br>SHIN TAN TABLETS \"SHOU CHAN\"(糖尿病)<br>', '2022-05-31 ( 星期二)   17:11:05', '李XX', ''),
(19, 'FUROSELY TABLETS \"M.S.\"(高血壓)<br>', '2022-05-31 ( 星期二)   17:11:28', '李XX', '稍有不適'),
(20, 'SHIN TAN TABLETS \"SHOU CHAN\"(糖尿病)<br>', '2022-05-31 ( 星期二)   20:32:18', '陳XX', '123'),
(21, 'FUROSELY TABLETS \"M.S.\"(高血壓)<br>', '2022-05-31 ( 星期二)   20:32:23', '陳XX', '456'),
(22, 'FUROSELY TABLETS \"M.S.\"(高血壓)<br>SHIN TAN TABLETS \"SHOU CHAN\"(糖尿病)<br>', '2022-05-31 ( 星期二)   22:29:52', '陳XX', 'abc'),
(23, 'FURSEDE TABLETS(高血壓)<br>SHIN TAN TABLETS \"SHOU CHAN\"(糖尿病)<br>', '2022-06-06 ( 星期一)   16:00:03', '李XX', ''),
(24, 'FUROSELY TABLETS \"M.S.\"(高血壓)<br>FURSEDE TABLETS(高血壓)<br>', '2022-06-06 ( 星期一)   17:04:33', '陳XX', '發燒'),
(25, 'FURSEDE TABLETS(高血壓)<br>SHIN TAN TABLETS \"SHOU CHAN\"(糖尿病)<br>', '2022-06-07 ( 星期二)   09:12:54', '陳XX', '');

-- --------------------------------------------------------

--
-- 資料表結構 `member`
--

CREATE TABLE `member` (
  `id_number` varchar(10) NOT NULL,
  `name` text DEFAULT NULL,
  `permission` text NOT NULL,
  `identity` text NOT NULL,
  `userid` text NOT NULL,
  `password` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `member`
--

INSERT INTO `member` (`id_number`, `name`, `permission`, `identity`, `userid`, `password`) VALUES
('D473890112', '張XX', '2', '病人', 'ghi456', 'ghi654'),
('F483901223', '徐XX', '1', '護理師', 'def456', 'def654'),
('F485739200', '江XX', '1', '護理師', 'jeff01478', '123456'),
('H382014573', '吳XX', '2', '病人', 'def123', 'def321'),
('K341256782', '林XX', '2', '病人', 'abc789', 'abc987'),
('Q120987324', '陳XX', '2', '病人', 'abc456', 'abc654'),
('R483909821', '何XX', '2', '病人', 'ghi789', 'ghi987'),
('S123456789', '呂XX', '2', '病人', 'abc789', 'abc987'),
('W128473029', '李XX', '2', '病人', 'abc123', 'abc321');

-- --------------------------------------------------------

--
-- 資料表結構 `patient_admission_info`
--

CREATE TABLE `patient_admission_info` (
  `id` int(11) NOT NULL,
  `ward_no` text NOT NULL,
  `r1` text NOT NULL,
  `bed_no` text NOT NULL,
  `r2` text NOT NULL,
  `phone_no` text NOT NULL,
  `r3` text NOT NULL,
  `address` text NOT NULL,
  `r4` text NOT NULL,
  `emergency_contact` text NOT NULL,
  `r5` text NOT NULL,
  `emergency_contact_no` text NOT NULL,
  `r6` text NOT NULL,
  `hospitalization_date` text NOT NULL,
  `r7` text NOT NULL,
  `observation_time` text NOT NULL,
  `r8` text NOT NULL,
  `attending_physician` text NOT NULL,
  `r9` text NOT NULL,
  `nurse` text NOT NULL,
  `r10` text NOT NULL,
  `current_condition` text NOT NULL,
  `r11` text NOT NULL,
  `transaction_info` text NOT NULL,
  `name` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `patient_admission_info`
--

INSERT INTO `patient_admission_info` (`id`, `ward_no`, `r1`, `bed_no`, `r2`, `phone_no`, `r3`, `address`, `r4`, `emergency_contact`, `r5`, `emergency_contact_no`, `r6`, `hospitalization_date`, `r7`, `observation_time`, `r8`, `attending_physician`, `r9`, `nurse`, `r10`, `current_condition`, `r11`, `transaction_info`, `name`) VALUES
(1, '712', '', '8', '', '0912567834', '', '新北市新店區安康路二段67號', '', '家人', '', '0912345123', '', '2022/1/19', '', '150', '', '蔡XX', '', '江XX', '', 'good', '', 'ewgdb', '李XX'),
(3, '712', '', '2', '', '0937482653', '', '台北市信義區中正路145號4樓之3', '', '家人', '', '0987346632', '', '2022/3/13', '', '500', '', '蔡XX', '', '江XX', '', 'not good', '', '無', '陳XX'),
(4, '', '', '3', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '林XX'),
(5, '', '', '5', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '吳XX'),
(8, '', '', '6', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '呂XX'),
(10, '', '', '4', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '何XX'),
(11, '', '', '7', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '張XX');

-- --------------------------------------------------------

--
-- 資料表結構 `patient_basic_info`
--

CREATE TABLE `patient_basic_info` (
  `id` int(11) NOT NULL,
  `id_no` text NOT NULL,
  `r1` text DEFAULT NULL,
  `chart_no` text NOT NULL,
  `r2` text DEFAULT NULL,
  `name` text NOT NULL,
  `r3` text DEFAULT NULL,
  `gender` text NOT NULL,
  `r4` text DEFAULT NULL,
  `birth_date` text NOT NULL,
  `r5` text DEFAULT NULL,
  `blood` text NOT NULL,
  `r6` text DEFAULT NULL,
  `rh` text NOT NULL,
  `r7` text DEFAULT NULL,
  `major_illness` text NOT NULL,
  `r8` text DEFAULT NULL,
  `allergies` text NOT NULL,
  `r9` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `patient_basic_info`
--

INSERT INTO `patient_basic_info` (`id`, `id_no`, `r1`, `chart_no`, `r2`, `name`, `r3`, `gender`, `r4`, `birth_date`, `r5`, `blood`, `r6`, `rh`, `r7`, `major_illness`, `r8`, `allergies`, `r9`) VALUES
(1, 'F130976236', '身分證號、護照號碼或居留證號', '123456', NULL, '李XX', NULL, '男性', NULL, '2001/08/13', '格式為西元YYYYMMDD', 'A', NULL, 'RH+', NULL, '無', '', '無', ''),
(5, 'A345638952', NULL, '34562567', NULL, '陳XX', NULL, '女性', NULL, '1983/05/21', NULL, 'AB', NULL, 'RH+', NULL, '糖尿病', NULL, '無', NULL),
(6, 'C368912456', NULL, '', NULL, '林XX', NULL, '', NULL, '', NULL, '', NULL, '', NULL, '', NULL, '', NULL),
(7, 'G430912348', NULL, '', NULL, '吳XX', NULL, '', NULL, '', NULL, '', NULL, '', NULL, '', NULL, '', NULL),
(8, 'H451098234', NULL, '', NULL, '何XX', NULL, '', NULL, '', NULL, '', NULL, '', NULL, '', NULL, '', NULL),
(9, 'K091234156', NULL, '', NULL, '呂XX', NULL, '', NULL, '', NULL, '', NULL, '', NULL, '', NULL, '', NULL),
(10, 'A132894732', NULL, '', NULL, '張XX', NULL, '', NULL, '', NULL, '', NULL, '', NULL, '', NULL, '', NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `responsible_nurse`
--

CREATE TABLE `responsible_nurse` (
  `id_number` varchar(10) NOT NULL,
  `name` text DEFAULT NULL,
  `p1` text DEFAULT NULL,
  `p2` text DEFAULT NULL,
  `p3` text DEFAULT NULL,
  `p4` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `responsible_nurse`
--

INSERT INTO `responsible_nurse` (`id_number`, `name`, `p1`, `p2`, `p3`, `p4`) VALUES
('F483901223', '徐XX', '何XX', '李XX', '張XX', NULL),
('F485739200', '江XX', '李XX', '陳XX', '林XX', '吳XX');

-- --------------------------------------------------------

--
-- 資料表結構 `room_round_record`
--

CREATE TABLE `room_round_record` (
  `id` int(11) NOT NULL,
  `date` text NOT NULL,
  `content` text NOT NULL,
  `name` text NOT NULL,
  `remark` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `room_round_record`
--

INSERT INTO `room_round_record` (`id`, `date`, `content`, `name`, `remark`) VALUES
(6, '2022-05-31 ( 星期二)   16:57:45', '量血壓<br>', '李XX', '高血壓'),
(7, '2022-05-31 ( 星期二)   16:57:57', '量體溫<br>', '李XX', '發燒'),
(8, '2022-05-31 ( 星期二)   16:59:03', '醫生診問<br>', '李XX', ''),
(9, '2022-05-31 ( 星期二)   22:30:08', '量體溫<br>', '李XX', ''),
(10, '2022-06-06 ( 星期一)   16:00:16', '換藥<br>', '李XX', '567'),
(11, '2022-06-06 ( 星期一)   17:04:45', '量血壓<br>', '陳XX', '789'),
(12, '2022-06-07 ( 星期二)   09:13:06', '量血壓<br>換藥<br>', '陳XX', '發燒');

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
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `data_change_text`
--
ALTER TABLE `data_change_text`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `med_time`
--
ALTER TABLE `med_time`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `member`
--
ALTER TABLE `member`
  ADD PRIMARY KEY (`id_number`),
  ADD UNIQUE KEY `name` (`name`) USING HASH;

--
-- 資料表索引 `patient_admission_info`
--
ALTER TABLE `patient_admission_info`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `patient_basic_info`
--
ALTER TABLE `patient_basic_info`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `responsible_nurse`
--
ALTER TABLE `responsible_nurse`
  ADD PRIMARY KEY (`id_number`),
  ADD UNIQUE KEY `name` (`name`) USING HASH;

--
-- 資料表索引 `room_round_record`
--
ALTER TABLE `room_round_record`
  ADD PRIMARY KEY (`id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `body_data`
--
ALTER TABLE `body_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `data_change_text`
--
ALTER TABLE `data_change_text`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `med_time`
--
ALTER TABLE `med_time`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `patient_admission_info`
--
ALTER TABLE `patient_admission_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `patient_basic_info`
--
ALTER TABLE `patient_basic_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `room_round_record`
--
ALTER TABLE `room_round_record`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `responsible_nurse`
--
ALTER TABLE `responsible_nurse`
  ADD CONSTRAINT `responsible_nurse_ibfk_1` FOREIGN KEY (`id_number`) REFERENCES `member` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
