'use strict';

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JITSI_APP_ID = process.env.JITSI_APP_ID || 'pawpet';
const JITSI_SECRET = process.env.JITSI_SECRET || 'jitsi-secret-key';
const JITSI_DOMAIN = process.env.JITSI_DOMAIN || 'meet.jit.si';

/**
 * Generate a unique Jitsi room name for a consultation.
 * @returns {string}
 */
function generateRoomName() {
  return `pawpet-${uuidv4()}`;
}

/**
 * Generate a signed Jitsi JWT for a given user and room.
 *
 * @param {object} params
 * @param {string} params.roomName
 * @param {string} params.userId
 * @param {string} params.userName
 * @param {string} params.userAvatar
 * @param {boolean} params.isModerator  - true for vets, false for owners
 * @returns {{ token: string, roomUrl: string }}
 */
function generateJitsiToken({ roomName, userId, userName, userAvatar = '', isModerator = false }) {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iss: JITSI_APP_ID,
    aud: 'jitsi',
    sub: JITSI_DOMAIN,
    room: roomName,
    exp: now + 60 * 60 * 2, // 2 hours
    iat: now,
    nbf: now - 10,
    context: {
      user: {
        id: userId,
        name: userName,
        avatar: userAvatar,
        moderator: isModerator,
      },
      features: {
        livestreaming: false,
        recording: false,
        transcription: false,
        outbound_call: false,
      },
    },
  };

  const token = jwt.sign(payload, JITSI_SECRET, { algorithm: 'HS256' });
  const roomUrl = `https://${JITSI_DOMAIN}/${roomName}?jwt=${token}`;

  return { token, roomUrl };
}

/**
 * Create a Jitsi session for a consultation.
 * Returns room name, URLs and tokens for both participant roles.
 *
 * @param {object} params
 * @param {string} params.consultationId
 * @param {object} params.owner   - { id, name, avatar }
 * @param {object} params.vet     - { id, name, avatar }
 * @returns {{ roomName: string, ownerToken: string, vetToken: string, roomUrl: string }}
 */
function createJitsiSession({ consultationId, owner, vet }) {
  const roomName = `pawpet-${consultationId}`;

  const { token: ownerToken } = generateJitsiToken({
    roomName,
    userId: owner.id,
    userName: owner.name,
    userAvatar: owner.avatar || '',
    isModerator: false,
  });

  const { token: vetToken, roomUrl } = generateJitsiToken({
    roomName,
    userId: vet.id,
    userName: vet.name,
    userAvatar: vet.avatar || '',
    isModerator: true,
  });

  return { roomName, ownerToken, vetToken, roomUrl };
}

module.exports = { generateRoomName, generateJitsiToken, createJitsiSession };
