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
-- Table structure for table `corporations`
--

CREATE TABLE `corporations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_kn` varchar(255) DEFAULT NULL,
  `bone_merchant_id` varchar(255) DEFAULT NULL,
  `meat_merchant_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `corporations`
--

INSERT INTO `corporations` (`id`, `name`, `name_kn`, `bone_merchant_id`, `meat_merchant_id`, `created_at`, `updated_at`) VALUES
(1, 'Central', 'ಕೇಂದ್ರ', NULL, NULL, '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(2, 'East', 'ಪೂರ್ವ', NULL, NULL, '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(3, 'North', 'ಉತ್ತರ', NULL, NULL, '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(4, 'West', 'ಪಶ್ಚಿಮ', NULL, NULL, '2026-06-27 07:34:57', '2026-06-27 07:34:57'),
(5, 'South', 'ದಕ್ಷಿಣ', 'TAFn5QMJHrsVM1', 'TAFa0r4lmaAdaE', '2026-06-27 07:34:57', '2026-07-07 00:05:38');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `corporations`
--
ALTER TABLE `corporations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `corporations`
--
ALTER TABLE `corporations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
