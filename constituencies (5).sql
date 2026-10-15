-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 15, 2026 at 09:40 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `volunteer_application`
--

-- --------------------------------------------------------

--
-- Table structure for table `constituencies`
--

CREATE TABLE `constituencies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `corporation_id` bigint(20) UNSIGNED NOT NULL,
  `ac_no` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `name_kn` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `constituencies`
--

INSERT INTO `constituencies` (`id`, `corporation_id`, `ac_no`, `name`, `name_kn`, `created_at`, `updated_at`) VALUES
(1, 1, 163, 'Shanthinagar', 'ಶಾಂತಿನಗರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(2, 2, 174, 'Mahadevapura', 'ಮಹದೇವಪುರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(3, 3, 150, 'Yelahanka', 'ಯಲಹಂಕ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(4, 3, 152, 'Byatarayanapura', 'ಬ್ಯಾಟರಾಯನಪುರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(5, 4, 154, 'Rajarajeshwarinagar', 'ರಾಜರಾಜೇಶ್ವರಿನಗರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(6, 4, 153, 'Yeshwanthapura', 'ಯಶವಂತಪುರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(7, 1, 168, 'Chamrajapet', 'ಚಾಮರಾಜಪೇಟೆ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(8, 1, 169, 'Chickpet', 'ಚಿಕ್ಕಪೇಟೆ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(9, 2, 151, 'K.R. Pura', 'ಕೆ.ಆರ್. ಪುರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(10, 4, 165, 'Rajajinagar', 'ರಾಜಾಜಿನಗರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(11, 5, 176, 'Bangalore South', 'ಬೆಂಗಳೂರು ದಕ್ಷಿಣ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(12, 5, 173, 'Jayanagar', 'ಜಯನಗರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(13, 1, 162, 'Shivajinagar', 'ಶಿವಾಜಿನಗರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(14, 5, 172, 'B.T.M Layout', 'ಬಿ.ಟಿ.ಎಂ. ಲೇಔಟ್', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(15, 4, 166, 'Govindraj Nagar', 'ಗೋವಿಂದರಾಜ ನಗರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(16, 3, 160, 'Sarvagnanagar', 'ಸರ್ವಜ್ಞನಗರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(17, 5, 171, 'Padmanabanagar', 'ಪದ್ಮನಾಭನಗರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(18, 4, 157, 'Malleshwaram', 'ಮಲ್ಲೇಶ್ವರಂ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(19, 1, 161, 'C.V. Raman Nagar', 'ಸಿ.ವಿ. ರಾಮನ್ ನಗರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(20, 3, 155, 'Dasarahalli', 'ದಾಸರಹಳ್ಳಿ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(21, 4, 155, 'Dasarahalli', 'ದಾಸರಹಳ್ಳಿ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(22, 4, 167, 'Vijayanagar', 'ವಿಜಯನಗರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(23, 5, 175, 'Bommanahalli', 'ಬೊಮ್ಮನಹಳ್ಳಿ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(24, 3, 159, 'Pulakeshinagar', 'ಪುಲಕೇಶಿನಗರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(25, 1, 164, 'Gandhinagara', 'ಗಾಂಧಿನಗರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(26, 3, 158, 'Hebbal', 'ಹೆಬ್ಬಾಳ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(27, 5, 153, 'Yeshwanthapura', 'ಯಶವಂತಪುರ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(28, 4, 170, 'Basavanagudi', 'ಬಸವನಗುಡಿ', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(29, 4, 156, 'Mahalakshmi Layout', 'ಮಹಾಲಕ್ಷ್ಮಿ ಲೇಔಟ್', '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(30, 4, 171, 'Padmanabanagar', 'ಪದ್ಮನಾಭನಗರ', '2026-06-27 07:34:58', '2026-06-27 07:34:58'),
(31, 5, 177, 'Anekal', 'ಆನೇಕಲ್', '2026-06-27 07:34:58', '2026-06-27 07:34:58'),
(32, 3, 154, 'Rajarajeshwarinagar', 'ರಾಜರಾಜೇಶ್ವರಿನಗರ', '2026-06-27 07:34:58', '2026-06-27 07:34:58'),
(33, 5, 174, 'Mahadevapura', 'ಮಹದೇವಪುರ', '2026-06-27 07:34:58', '2026-06-27 07:34:58');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `constituencies`
--
ALTER TABLE `constituencies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `new_constituencies_new_corporation_id_foreign` (`corporation_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `constituencies`
--
ALTER TABLE `constituencies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `constituencies`
--
ALTER TABLE `constituencies`
  ADD CONSTRAINT `new_constituencies_new_corporation_id_foreign` FOREIGN KEY (`corporation_id`) REFERENCES `corporations` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
