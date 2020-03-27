-- TABLAS
CREATE TABLE `santander-frio`.`usuarios` (
  `dni` INT NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `password` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`dni`)
) ENGINE = InnoDB;

CREATE TABLE `santander-frio`.`cuentas` (
  `cbu` INT NOT NULL AUTO_INCREMENT,
  `id_user` INT NOT NULL,
  `currency` VARCHAR(10) NOT NULL,
  `balance` INT NULL,
  `ext_limit` INT NULL DEFAULT '5000',
  PRIMARY KEY (`cbu`)
) ENGINE = InnoDB;

CREATE TABLE `santander-frio`.`operacion` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE `santander-frio`.`log_operaciones` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(120) NOT NULL,
  `amount` INT NOT NULL,
  `date` DATE NULL DEFAULT CURRENT_TIMESTAMP,
  `id_transaction` INT NOT NULL,
  `id_origin` INT NOT NULL,
  `id_destination` INT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- RELACIONES
ALTER TABLE
  `cuentas`
ADD
  FOREIGN KEY (`id_user`) REFERENCES `usuarios`(`dni`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE
  `log_operaciones`
ADD
  FOREIGN KEY (`id_transaction`) REFERENCES `operacion`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE
  `log_operaciones`
ADD
  FOREIGN KEY (`id_origin`) REFERENCES `cuentas`(`cbu`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE
  `log_operaciones`
ADD
  FOREIGN KEY (`id_destination`) REFERENCES `cuentas`(`cbu`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- INSERTS
INSERT INTO
  `usuarios` (`dni`, `name`, `password`)
VALUES
  ('10', 'Iván Canga', 'asd123'),
  ('20', 'Alexis Lazzurri', 'asd123'),
  ('30', 'Guido Torres', 'asd123');

INSERT INTO
  `operacion` (`id`, `description`)
VALUES
  (NULL, 'Depósito en cuenta'),
  (NULL, 'Transferencia a cuenta'),
  (NULL, 'Compra moneda extranjera'),
  (NULL, 'Venta moneda extranjera');

INSERT INTO
  `cuentas` (
    `cbu`,
    `id_user`,
    `currency`,
    `balance`,
    `ext_limit`
  )
VALUES
  ('100', '10', 'ars', NULL, '5000'),
  ('150', '10', 'usd', NULL, '5000'),
  ('200', '20', 'ars', NULL, '5000'),
  ('250', '20', 'usd', NULL, '5000'),
  ('300', '20', 'ars', NULL, '5000'),
  ('350', '30', 'usd', NULL, '5000');