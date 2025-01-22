CREATE TABLE stocks (
    stock_symbol VARCHAR(10) PRIMARY KEY,
    price INT NOT NULL
);

CREATE TABLE stock_ownership (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    stock_symbol VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    UNIQUE KEY (user_id, stock_symbol)
);

CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    discriminator VARCHAR(10),
    balance INT DEFAULT 0
);
