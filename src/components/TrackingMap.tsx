'use client';

import React from 'react';
import { MapPin, Navigation, Compass, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { TrackingCheckpoint } from '@/types';

interface TrackingMapProps {
  checkpoints: TrackingCheckpoint[];
  courierInfo: string;
  trackingNumber: string | null;
  shippingAddress: string;
}

export default function TrackingMap({
  checkpoints,
  courierInfo,
  trackingNumber,
  shippingAddress,
}: TrackingMapProps) {
  const latestCheckpoint =
    checkpoints.length > 0 ? checkpoints[checkpoints.length - 1] : null;

  const hasCoordinates =
    latestCheckpoint &&
    latestCheckpoint.latitude !== null &&
    latestCheckpoint.longitude !== null;

  // Koordinat default (atau koordinat checkpoint terbaru)
  const lat = hasCoordinates ? Number(latestCheckpoint.latitude) : -6.2088;
  const lon = hasCoordinates ? Number(latestCheckpoint.longitude) : 106.8456;

  // Bounding box kecil untuk OpenStreetMap embed
  const delta = 0.03;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div className="space-y-4">
      {/* Kartu Status Koordinat Terkini */}
      <div className="rounded-2xl border border-slate-200 bg-surface p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
              <Navigation className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                Posisi Koordinat Kurir Terkini
              </span>
              <h3 className="text-sm font-bold text-primary">
                {latestCheckpoint ? latestCheckpoint.location_name : 'Menunggu Update Titik Kurir'}
              </h3>
            </div>
          </div>

          {hasCoordinates && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 font-mono text-xs text-primary">
              <Compass className="h-3.5 w-3.5 text-accent" />
              <span>
                Lat: {Number(latestCheckpoint.latitude).toFixed(5)}, Lon:{' '}
                {Number(latestCheckpoint.longitude).toFixed(5)}
              </span>
            </div>
          )}
        </div>

        {/* Tampilan Peta Interaktif (OpenStreetMap - 100% Zero-Cost & Bebas Biaya) */}
        <div className="mt-4 relative h-64 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {hasCoordinates ? (
            <iframe
              title="Peta Titik Koordinat Pengiriman"
              src={osmUrl}
              className="h-full w-full border-0"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-slate-400">
              <MapPin className="h-10 w-10 stroke-1 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                Peta Menunggu Data GPS Kurir
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                Penjual/kurir belum memperbarui koordinat posisi terkini paket.
              </p>
            </div>
          )}

          {/* Info Badge Mengambang di atas peta */}
          <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-surface/95 backdrop-blur-sm border border-slate-200 p-2.5 shadow-sm text-xs flex justify-between items-center">
            <div className="truncate pr-2">
              <p className="font-semibold text-primary truncate">
                Tujuan: {shippingAddress}
              </p>
              <p className="text-[10px] text-slate-500">Kurir: {courierInfo}</p>
            </div>
            {trackingNumber && (
              <span className="shrink-0 font-mono text-[10px] font-bold text-accent bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                Resi: {trackingNumber}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Riwayat Titik Checkpoint Perjalanan */}
      <div className="rounded-2xl border border-slate-200 bg-surface p-4 sm:p-5 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-accent" />
          Riwayat Perjalanan & Titik Checkpoint
        </h4>

        {checkpoints.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            Paket sedang dipersiapkan di fasilitas logistik. Checkpoint pertama akan segera muncul saat kurir bergerak.
          </p>
        ) : (
          <div className="relative border-l border-slate-200 ml-3 pl-5 space-y-5 text-xs">
            {checkpoints.map((cp, idx) => {
              const isLatest = idx === checkpoints.length - 1;
              return (
                <div key={cp.id} className="relative">
                  {/* Marker Dot */}
                  <div
                    className={`absolute -left-[27px] top-0 flex h-4 w-4 items-center justify-center rounded-full ${
                      isLatest
                        ? 'bg-accent ring-4 ring-blue-100 text-white'
                        : 'bg-slate-300'
                    }`}
                  >
                    {isLatest && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <p className={`font-bold ${isLatest ? 'text-accent' : 'text-primary'}`}>
                        {cp.location_name}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(cp.created_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {cp.description && (
                      <p className="text-slate-600 mt-0.5">{cp.description}</p>
                    )}

                    {cp.latitude !== null && cp.longitude !== null && (
                      <p className="mt-1 font-mono text-[10px] text-slate-400">
                        📍 Koordinat: {Number(cp.latitude).toFixed(4)}, {Number(cp.longitude).toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

