export default function PreviewInfo() {
const isOn = process.env.DRAFT_MODE === 'true';
return (
<div className="space-y-4">
<h1 className="text-2xl font-semibold">Preview Mode</h1>
<p>Draft mode is <strong>{isOn ? 'ON' : 'OFF'}</strong>. Configure per-provider preview tokens and routes as needed.</p>
</div>
);
}