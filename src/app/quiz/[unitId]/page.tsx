import { getUnits } from "@/utils/vocab";
import Quiz from "@/components/Quiz";
import { notFound } from "next/navigation";

interface QuizPageProps {
  params: {
    unitId: string;
  };
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { unitId } = await params;
  const units = getUnits();
  const unit = units.find((u) => u.id === unitId);

  if (!unit) {
    notFound();
  }

  return <Quiz unitId={unit.id} unitWords={unit.words} unitTitle={unit.title} />;
}
