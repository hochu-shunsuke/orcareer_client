import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Event {
  id: string;
  title: string;
  date: string;
  color: string;
}

const events: Event[] = [
  {
    id: '1',
    title: '合同企業説明会',
    date: '3月15日（金）開催',
    color: 'border-orange-500'
  },
  {
    id: '2',
    title: 'IT業界セミナー',
    date: '3月20日（水）開催',
    color: 'border-blue-500'
  },
  {
    id: '3',
    title: '面接対策講座',
    date: '3月25日（月）開催',
    color: 'border-green-500'
  },
  {
    id: '4',
    title: 'インターンシップ説明会',
    date: '4月5日（金）開催',
    color: 'border-purple-500'
  }
];

export function EventInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>イベント情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event) => (
          <div 
            key={event.id}
            className={`border-l-4 ${event.color} pl-4 hover:bg-gray-50 transition-colors cursor-pointer py-2`}
          >
            <h4 className="font-semibold text-sm">{event.title}</h4>
            <p className="text-xs text-gray-600">{event.date}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
