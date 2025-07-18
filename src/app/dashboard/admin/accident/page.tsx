"use client";

import { useEffect, useState } from "react";
import { SensorData } from "@/types/sensor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faSyncAlt,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";
import fetchWithAuth from "@/lib/fetchWithAuth";

export default function SensorDataPage() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetchWithAuth("/api/sensor-data");
      const data = await response.json();
      setSensorData(data);
    } catch (error) {
      console.error("Error fetching sensor data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Set up polling every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-2xl shadow-xl shadow-kuromi-primary/20 transition-transform duration-300 hover:-translate-y-1">
          <div className="bg-gradient-to-r from-kuromi-primary to-kuromi-secondary rounded-t-2xl p-6 border-b-2 border-kuromi-accent">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <FontAwesomeIcon icon={faChartLine} className="mr-6" />
                Fall Sensor Data
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="bg-kuromi-secondary border-b-2 border-kuromi-accent">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Sensor ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Accel X
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Accel Y
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Accel Z
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Total Accel
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sensorData.length > 0 ? (
                  sensorData.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-kuromi-primary/10 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-kuromi-primary text-white text-sm">
                          #{row.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">{row.sensor_id}</td>
                      <td className="px-6 py-4">{row.accX.toFixed(2)}</td>
                      <td className="px-6 py-4">{row.accY.toFixed(2)}</td>
                      <td className="px-6 py-4">{row.accZ.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full ${row.totalAccel > 1.5 ? "bg-red-500" : "bg-green-500"} text-white text-sm`}
                        >
                          {row.totalAccel.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(row.timestamp).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12">
                      <div className="text-center text-kuromi-accent">
                        <FontAwesomeIcon
                          icon={faDatabase}
                          className="text-5xl mb-4"
                        />
                        <p className="text-lg">
                          Belum ada data sensor yang tersedia
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <button
        onClick={fetchData}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-kuromi-primary text-white shadow-lg shadow-kuromi-primary/30 hover:bg-kuromi-secondary transition-all duration-300 hover:rotate-180 flex items-center justify-center"
      >
        <FontAwesomeIcon icon={faSyncAlt} />
      </button>
    </div>
  );
}
