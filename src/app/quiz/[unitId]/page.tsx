import { getUnits } from "@/utils/vocab";
import Quiz from "@/components/Quiz";
import { notFound } from "next/navigation";

interface QuizPageProps {
  params: Promise<{
    unitId: string;
  }>;
  searchParams: Promise<{
    sources?: string;
  }>;
}

export async function generateStaticParams() {
  const units = getUnits();
  return units.map((unit) => ({
    unitId: unit.id,
  }));
}

export default async function QuizPage({ params, searchParams }: QuizPageProps) {
  const { unitId } = await params;
  const { sources: sourcesStr } = await searchParams;

  const sources = sourcesStr ? sourcesStr.split(',') : ['1'];

  const units = getUnits(sources);
  const unit = units.find((u) => u.id === unitId);

  if (!unit) {
    notFound();
  }

  return <Quiz unitId={unit.id} unitWords={unit.words} unitTitle={unit.title} sources={sources} />;
}
