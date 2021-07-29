# how to use bot

### settings

.env contains settings for:
- bot username
- bot oauth token
- channel name

Bot username and oauth token should rarely be changed.
Channel name will need changed whenever the bot needs directed to a different channel.

### optimizations

1. filter assets from Alpaca's /assets endpoint so assetsArr is smaller
  - remove non-tradeable
  - remove non-fractionable
2. error processing
  - if GET fails
  - if POST fails
  


