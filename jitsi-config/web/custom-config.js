// Pawpet config overrides — appended to config.js at container startup
config.disableDeepLinking = true;
config.prejoinPageEnabled = true;
config.enableWelcomePage = true;
config.resolution = 720;
config.constraints = {
  video: { height: { ideal: 720, max: 1080, min: 240 } }
};
