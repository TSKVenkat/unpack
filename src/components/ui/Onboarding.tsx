import React from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { FiGithub, FiSearch, FiBookmark } from 'react-icons/fi';

type OnboardingProps = {
  type: 'dashboard' | 'analysis' | 'search';
  onAction?: () => void;
};

export const Onboarding: React.FC<OnboardingProps> = ({ type, onAction }) => {
  const content = {
    dashboard: {
      icon: <FiGithub className="w-16 h-16 text-playfulRed" />,
      title: "No Analyses Yet",
      description: "Start by analyzing your first GitHub repository to get detailed insights and architecture details.",
      cta: "Analyze Repository",
    },
    analysis: {
      icon: <FiSearch className="w-16 h-16 text-playfulRed" />,
      title: "No Analysis Found",
      description: "We couldn't find any analysis for this repository. Start a new analysis to get insights.",
      cta: "Start Analysis",
    },
    search: {
      icon: <FiBookmark className="w-16 h-16 text-playfulRed" />,
      title: "No Results Found",
      description: "Try adjusting your search terms or browse through our featured repositories.",
      cta: "Browse Featured",
    },
  }[type];

  return (
    <Card className="flex flex-col items-center text-center p-12 bg-white border-0">
      <div className="mb-6">{content.icon}</div>
      <h3 className="text-2xl font-bold mb-3 text-playfulBlack">{content.title}</h3>
      <p className="text-playfulGray mb-8 max-w-md">{content.description}</p>
      {onAction && (
        <Button onClick={onAction} className="px-8">
          {content.cta}
        </Button>
      )}
    </Card>
  );
};

export default Onboarding; 