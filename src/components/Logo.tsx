import ecosortLogo from '@/assets/uploads/ecosort-logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animated?: boolean;
}

export function Logo({ size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-10',
    md: 'h-16',
    lg: 'h-24',
  };

  return (
    <div className="flex items-center justify-center">
      <img
        src={ecosortLogo}
        alt="EcoSort Logo"
        className={`${sizeClasses[size]} w-auto`}
      />
    </div>
  );
}