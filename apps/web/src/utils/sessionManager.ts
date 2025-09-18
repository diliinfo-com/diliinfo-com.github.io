import { v4 as uuidv4 } from 'uuid';
import { safeLocalStorage } from './enhancedBrowserCompat';

const SESSION_ID_KEY = 'dili-session-id';
const DEVICE_ID_KEY = 'dili-device-id';

/**
 * 获取或创建一个唯一的会话ID。
 * 会话ID在浏览器会话期间保持不变。
 */
export function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

/**
 * 获取或创建一个唯一的设备ID。
 * 设备ID会持久保存在localStorage中，以在多次访问中识别同一设备。
 */
export function getDeviceId(): string {
  let deviceId = safeLocalStorage.get(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = uuidv4();
    safeLocalStorage.set(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * 将会话和设备信息附加到API请求中。
 * @param data - 要发送的请求数据
 * @returns 附加了会话信息的数据
 */
export function withSessionData<T extends object>(data: T): T & { sessionId: string; deviceId: string } {
  return {
    ...data,
    sessionId: getSessionId(),
    deviceId: getDeviceId(),
  };
}