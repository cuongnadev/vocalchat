import type { User } from "@/types/user";
import { Save, User as UserIcon, Mail, Phone, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button/Button";
import { Input } from "../ui/input/input";

type SettingsViewProps = {
  className?: string;
  currentUser: User;
  onSaveSettings: (updatedUser: Partial<User>) => void;
};

export const SettingsView = ({
  className,
  currentUser,
  onSaveSettings,
}: SettingsViewProps) => {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    avatar: currentUser.avatar,
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    const updates: Partial<User & { oldPassword: string }> = {
      name: formData.name,
      email: formData.email,
      avatar: formData.avatar,
      oldPassword: formData.currentPassword,
      password: formData.newPassword,
    };

    onSaveSettings(updates);
  };

  return (
    <div
      className={`${className} bg-white/5 backdrop-blur-xl flex flex-col h-screen`}
    >
      {/* Header */}
      <div className="shrink-0 border-b border-white/10 bg-white/5 backdrop-blur-xl px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage your account settings
          </p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Section */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserIcon size={20} className="text-[#00FFFF]" />
              Profile Information
            </h3>

            {/* Avatar */}
            <div className="mb-6 text-center">
              <div className="inline-block relative">
                <img
                  src={formData.avatar}
                  alt="Avatar"
                  className="rounded-full w-24 h-24 object-cover border-4 border-white/20"
                />
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#00FFFF] rounded-full border-2 border-[#0a001f]"></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Click to change avatar
              </p>
            </div>

            {/* Name */}
            <Input
              label="Display Name"
              icon={<UserIcon size={16} className="text-[#00FFFF]" />}
              iconPosition="left"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              variant="third"
              radius="lg"
              className="mb-4"
            />

            {/* Email */}
            <Input
              label="Email Address"
              icon={<Mail size={16} className="text-[#8B5CF6]" />}
              iconPosition="left"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              variant="third"
              radius="lg"
              className="mb-4"
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              icon={<Phone size={16} className="text-[#00FFFF]" />}
              iconPosition="left"
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleInputChange}
              variant="third"
              radius="lg"
            />
          </div>

          {/* Security Section */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Lock size={20} className="text-[#8B5CF6]" />
              Security
            </h3>

            {/* Current Password */}
            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              placeholder="Enter current password"
              value={formData.currentPassword}
              onChange={handleInputChange}
              variant="third"
              radius="lg"
              className="mb-4"
            />

            {/* New Password */}
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleInputChange}
              variant="third"
              radius="lg"
              className="mb-4"
            />

            {/* Confirm Password */}
            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              variant="third"
              radius="lg"
            />
          </div>

          {/* Save Button */}
          <Button
            text="Save Changes"
            icon={<Save size={20} />}
            iconPosition="left"
            variant="primary"
            size="lg"
            radius="lg"
            onClick={handleSave}
            className="w-full shadow-lg hover:shadow-xl"
          />
        </div>
      </div>
    </div>
  );
};
