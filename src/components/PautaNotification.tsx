interface PautaNotificationProps {
  visible: boolean;
}

export default function PautaNotification({ visible }: PautaNotificationProps) {
  if (!visible) return null;
  return (
    <div
      className="mx-auto my-4 px-4 py-2 rounded font-bold text-[clamp(0.875rem,2.5vw,1rem)] z-[1]"
      style={{
        backgroundColor: '#e7f3fe',
        border: '1px solid #2196F3',
        color: '#0d47a1',
      }}
    >
      A pauta da SGP já está pronta.
    </div>
  );
}
