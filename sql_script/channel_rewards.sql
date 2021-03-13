CREATE TABLE channel_rewards (
reward_id VARCHAR(32) PRIMARY KEY,
name VARCHAR(180),
tier int(3),
cost int,
redemption_count int
);