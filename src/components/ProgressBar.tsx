interface ProgressBarProps {
  visible: boolean;
  value: number;
  text: string;
}

export default function ProgressBar({ visible, value, text }: ProgressBarProps) {
  if (!visible) return null;

  return (
    <div className="mx-auto my-4 w-[90%] max-w-[20rem] z-[1]">
      <progress
        value={value}
        max={100}
        className="w-full"
        style={{ appearance: 'auto' }}
      />
      <p
        className="text-center text-[clamp(0.875rem,2.5vw,1rem)]"
        style={{ color: '#777' }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
}
