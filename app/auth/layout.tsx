import Logo from "@/components/logo/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-8 md:p-12"
        style={{ backgroundColor: '#0a0a0f' }}
      >
        <div>
          <Logo />
        </div>

        <div>
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Communication at Scale
            </h1>
            <p className="text-gray-300 text-lg">
              Send SMS, Email, OTP, and manage files with a single API. Simple, reliable.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-4">
            {[
              { icon: '✓', text: 'SMS & Email APIs' },
              { icon: '✓', text: 'OTP Verification' },
              { icon: '✓', text: 'File Storage & CDN' },
              { icon: '✓', text: 'Real-time Analytics' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span
                  className="font-bold text-xl"
                  style={{ color: '#DC143C' }}
                >
                  {feature.icon}
                </span>
                <span className="text-gray-300">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-400 text-sm">
          © 2025 DropAPHI. All rights reserved.
        </p>
      </div>

      {/* Right Side - Form */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8"
        style={{ backgroundColor: '#FAFAFA' }}
      >
        {children}
      </div>
    </div>
  );
}
