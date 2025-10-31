import { cookies } from 'next/headers';

async function fetchSubmission(companyId: string) {
  const backend = process.env.BACKEND_URL || 'http://localhost:8000';
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value || cookieStore.get('access')?.value;
  const res = await fetch(`${backend}/api/v1/smi-submission/?companyId=${encodeURIComponent(companyId)}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function Page({ params }: { params: { companyId: string } }) {
  const data = await fetchSubmission(params.companyId);
  const risk = data?.risk_assessment ?? null;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Risk Assessment</h1>
      {!risk ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          Risk Assessment has not been run for this period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Risk</th>
                <th className="p-2 text-right">Weight</th>
                <th className="p-2 text-right">Score</th>
                <th className="p-2 text-left">Rating</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Credit', 'credit'],
                ['Market', 'market'],
                ['Liquidity', 'liquidity'],
                ['Operational', 'operational'],
                ['Legal', 'legal'],
                ['Compliance', 'compliance'],
                ['Strategic', 'strategic'],
                ['Reputation', 'reputation'],
              ].map(([label, key]) => (
                <tr key={key} className="border-t">
                  <td className="p-2">{label}</td>
                  <td className="p-2 text-right">{risk[`${key}_risk_weight`]}</td>
                  <td className="p-2 text-right">{risk[`${key}_risk_score`]}</td>
                  <td className="p-2">{risk[`${key}_risk_rating`]}</td>
                </tr>
              ))}
              <tr className="border-t bg-gray-50">
                <td className="p-2 font-medium">Composite Rating</td>
                <td className="p-2" colSpan={2}></td>
                <td className="p-2 font-medium">{risk.composite_risk_rating}</td>
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="p-2 font-medium">FSI Score</td>
                <td className="p-2" colSpan={2}></td>
                <td className="p-2 font-medium">{risk.fsi_score}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <RunButton submissionId={data?.id} />
    </div>
  );
}

function RunButton({ submissionId }: { submissionId?: number }) {
  const cookieStore = cookies();
  const role = cookieStore.get('role')?.value;
  if (!submissionId || role !== 'COMMISSION_ANALYST') return null;
  return (
    <form action={`/api/risk/calculate`} method="post">
      <input type="hidden" name="submissionId" value={String(submissionId)} />
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" type="submit">
        Run Risk Assessment
      </button>
    </form>
  );
}


