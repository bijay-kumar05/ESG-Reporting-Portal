UPDATE `users` SET `role` = 'ADMIN' WHERE `email` = 'admin@esgportal.com';
INSERT IGNORE INTO `groups` (`id`, `name`, `code`) VALUES (1, 'MEIL Group', 'MEIL');
INSERT IGNORE INTO `subsidiaries` (`id`, `group_id`, `name`, `code`) VALUES (1, 1, 'MEIL Infrastructure Ltd', 'MEIL-INFRA'), (2, 1, 'MEIL Energy Ltd', 'MEIL-ENERGY');
INSERT IGNORE INTO `business_units` (`id`, `subsidiary_id`, `name`, `code`) VALUES (1, 1, 'Roads & Highways', 'RH-BU'), (2, 1, 'Buildings', 'BLD-BU'), (3, 2, 'Solar Projects', 'SOL-BU');
