
CREATE TABLE channel_rewards (
    reward_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(180),
    user_id VARCHAR(32),
    tier int(3),
    cost int,
    redemption_count int
);

INSERT INTO channel_rewards (reward_id, name, user_id, tier, cost, redemption_count)
VALUES ('1b7592c0-c6a0-4d2f-aaef-04902cc474fb', 'Drink Water', 'billy', 1, 500, 67);