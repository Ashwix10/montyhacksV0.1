import React from 'react';
import { SecurityScore as SecurityScoreType } from '@/types/sandbox';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface SecurityScoreProps {
  score: SecurityScoreType;
}

export function SecurityScore({ score }: SecurityScoreProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  };

  const getSeverityColor = (severity: string, count: number) => {
    if (count === 0) return 'text-gray-400';
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card className="glass-morphism border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Security Score</h3>
          <Badge className={getGradeColor(score.grade)}>
            {score.grade}
          </Badge>
        </div>

        {/* Overall Score Circle */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(score.overall / 100) * 283} 283`}
                className={`transition-all duration-1000 ease-out ${getScoreColor(score.overall)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(score.overall)}`}>
                  {score.overall}
                </div>
                <div className="text-xs text-muted-foreground">/ 100</div>
              </div>
            </div>
          </div>
        </div>

        {/* Component Scores */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Code Quality</span>
              <span className={`font-medium ${getScoreColor(score.codeQuality)}`}>
                {score.codeQuality}%
              </span>
            </div>
            <Progress value={score.codeQuality} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Security</span>
              <span className={`font-medium ${getScoreColor(score.security)}`}>
                {score.security}%
              </span>
            </div>
            <Progress value={score.security} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Performance</span>
              <span className={`font-medium ${getScoreColor(score.performance)}`}>
                {score.performance}%
              </span>
            </div>
            <Progress value={score.performance} className="h-2" />
          </div>
        </div>

        {/* Vulnerability Breakdown */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <h4 className="text-sm font-medium mb-3">Vulnerability Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(score.vulnerabilities).map(([severity, count]) => (
              <div key={severity} className="flex justify-between text-sm">
                <span className="capitalize text-muted-foreground">{severity}</span>
                <span className={`font-medium ${getSeverityColor(severity, count)}`}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
