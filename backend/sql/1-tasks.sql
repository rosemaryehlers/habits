DELIMITER $$

DROP PROCEDURE IF EXISTS createTable_tasks $$
CREATE PROCEDURE createTable_tasks()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='tasks') THEN
        CREATE TABLE `tasks` (
            `id`        smallint unsigned   NOT NULL AUTO_INCREMENT,
            `name`      varchar(20)         NOT NULL COLLATE utf8_bin,
            `type`      varchar(10)         NOT NULL COLLATE utf8_bin,
            `goal`      smallint unsigned   NULL,
            `created`   datetime            DEFAULT CURRENT_TIMESTAMP,
            `updated`   datetime            DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY (`name`)   
        ) ENGINE=InnoDB CHARSET=utf8 COLLATE=utf8_bin;
    END IF;
END $$
DELIMITER ;

CALL createTable_tasks();
DROP PROCEDURE createTable_tasks;