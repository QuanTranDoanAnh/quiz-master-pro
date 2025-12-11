import React from 'react';
import type { Question } from '../types';
import { clsx } from 'clsx';
import { Check, X } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  selectedOptionIds: string[];
  onToggleOption: (optionId: string) => void;
  isSubmitted: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOptionIds,
  onToggleOption,
  isSubmitted,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-800 leading-relaxed">
          <span className="text-primary mr-2">Q{question.originalNumber}:</span>
          {question.text}
        </h3>
        <p className="text-xs text-slate-500 mt-2 uppercase tracking-wider font-bold">
          Select all that apply
        </p>
      </div>

      <div className="p-4 space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id);
          const isCorrect = option.isCorrect;
          
          // Styles based on state
          let containerClass = "relative flex items-start p-4 cursor-pointer rounded-lg border-2 transition-all duration-200";
          
          if (isSubmitted) {
            if (isCorrect) {
              containerClass += " bg-green-50 border-green-500 ring-1 ring-green-500";
            } else if (isSelected && !isCorrect) {
              containerClass += " bg-red-50 border-red-500";
            } else {
              containerClass += " border-slate-200 opacity-60";
            }
          } else {
            if (isSelected) {
              containerClass += " bg-blue-50 border-blue-500 ring-1 ring-blue-500";
            } else {
              containerClass += " border-slate-200 hover:border-slate-300 hover:bg-slate-50";
            }
          }

          return (
            <div
              key={option.id}
              onClick={() => !isSubmitted && onToggleOption(option.id)}
              className={containerClass}
            >
              <div className="flex items-center h-5">
                <div className={clsx(
                  "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                  isSubmitted && isCorrect ? "bg-green-500 border-green-500 text-white" :
                  isSubmitted && isSelected && !isCorrect ? "bg-red-500 border-red-500 text-white" :
                  isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-400 bg-white"
                )}>
                  {isSubmitted && isCorrect && <Check size={12} strokeWidth={3} />}
                  {isSubmitted && !isCorrect && isSelected && <X size={12} strokeWidth={3} />}
                  {!isSubmitted && isSelected && <Check size={12} strokeWidth={3} />}
                </div>
              </div>
              <div className="ml-3 text-sm md:text-base">
                <span className="font-bold mr-2 uppercase">{option.id}.</span>
                <span className={clsx(
                  "text-slate-700",
                  isSubmitted && isCorrect && "font-bold text-green-800"
                )}>
                  {option.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {isSubmitted && (
         <div className="bg-slate-50 p-4 border-t border-slate-200 text-sm">
           <span className="font-semibold text-slate-700">Answer Key: </span>
           {question.options.filter(o => o.isCorrect).map(o => o.id.toUpperCase()).join(', ')}
         </div>
      )}
    </div>
  );
};
