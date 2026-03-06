import { QRCodeSVG } from 'qrcode.react';

export function RemoteQRCode() {
  const remoteUrl = `${window.location.origin}/remote`;

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <QRCodeSVG
        value={remoteUrl}
        size={160}
        bgColor="#1e293b"
        fgColor="#ffffff"
        level="M"
        style={{ borderRadius: 8 }}
      />
      <div className="text-center">
        <p className="text-xs text-gray-400">Scan to open timer on another device</p>
        <p className="text-xs text-gray-600 mt-1 font-mono">{remoteUrl}</p>
      </div>
    </div>
  );
}
