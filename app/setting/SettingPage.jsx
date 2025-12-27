"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: false,
    twoFactor: false,
  });

  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-[60px] px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
            Settings
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your account preferences and security
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">

          {/* Notifications */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Notifications
            </h2>

            <div className="space-y-4">
              <SettingToggle
                title="Property Alerts"
                description="Get notified about new matching properties"
                enabled={settings.notifications}
                onToggle={() => toggleSetting("notifications")}
              />

              <SettingToggle
                title="Email Updates"
                description="Receive newsletters and offers via email"
                enabled={settings.emailUpdates}
                onToggle={() => toggleSetting("emailUpdates")}
              />
            </div>
          </div>

          {/* Appearance */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Appearance
            </h2>

            <SettingToggle
              title="Dark Mode"
              description="Switch between light and dark theme"
              enabled={settings.darkMode}
              onToggle={() => toggleSetting("darkMode")}
            />
          </div>

          {/* Security */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Security
            </h2>

            <SettingToggle
              title="Two-Factor Authentication"
              description="Add extra security to your account"
              enabled={settings.twoFactor}
              onToggle={() => toggleSetting("twoFactor")}
            />

            <button className="mt-4 text-sm text-red-600 hover:underline">
              Change Password
            </button>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition">
              Save Settings
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* Toggle Component */
function SettingToggle({ title, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between border rounded-xl p-4">
      <div>
        <p className="font-medium text-gray-800">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <button
        onClick={onToggle}
        className={`w-12 h-6 flex items-center rounded-full px-1 transition ${
          enabled ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`w-4 h-4 bg-white rounded-full transform transition ${
            enabled ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
