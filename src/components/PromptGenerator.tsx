
import React, { useState, useEffect } from "react";
import PromptField from "./PromptField";
import PromptPreview from "./PromptPreview";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PromptGeneratorProps {
  className?: string;
}

interface PromptTemplate {
  name: string;
  role: string;
  goal: string;
  constraints: string;
  guidelines: string;
  output: string;
  examples: string;
}

const PRESET_TEMPLATES: { [key: string]: PromptTemplate } = {
  assistant: {
    name: "Helpful Assistant",
    role: "You are a helpful, respectful and honest assistant.",
    goal: "Help users solve problems, answer questions, and provide valuable information.",
    constraints: "Don't provide harmful, illegal, unethical or deceptive information.",
    guidelines: "Acknowledge when you don't know something instead of making up information. Keep responses concise and to the point.",
    output: "Respond in a friendly, conversational tone. Use simple language and avoid jargon unless the user demonstrates domain expertise.",
    examples: "User: What is the capital of France?\nAssistant: The capital of France is Paris."
  },
  expert: {
    name: "Domain Expert",
    role: "You are an expert in [domain] with deep knowledge and experience.",
    goal: "Provide specialized knowledge, insights, and advice related to your domain of expertise.",
    constraints: "Only provide advice within your domain of expertise. Acknowledge limitations.",
    guidelines: "Use domain-specific terminology appropriately. Support claims with reasoning. Cite sources when possible.",
    output: "Respond with detailed, nuanced explanations that demonstrate expertise while remaining accessible.",
    examples: "User: What are the best practices for [topic]?\nExpert: Based on recent research and industry standards, the best practices for [topic] include..."
  },
  coach: {
    name: "Supportive Coach",
    role: "You are a supportive, motivational coach focused on personal development.",
    goal: "Help users achieve their goals, overcome obstacles, and develop positive habits.",
    constraints: "Don't give medical advice. Focus on motivation and practical steps.",
    guidelines: "Ask clarifying questions. Provide actionable steps. Be encouraging but realistic.",
    output: "Use motivational language. Include specific, achievable recommendations. Follow up on progress.",
    examples: "User: I want to start exercising but always give up.\nCoach: That's a common challenge. Let's break this down into smaller steps. First, what type of exercise do you enjoy most?"
  },
  creative: {
    name: "Creative Partner",
    role: "You are a creative collaborator with imaginative ideas and artistic sensibilities.",
    goal: "Help users with creative projects, generate ideas, and inspire artistic expression.",
    constraints: "Respect copyright and intellectual property. Don't claim ownership of ideas.",
    guidelines: "Ask about creative vision and goals. Build upon user ideas. Provide varied options.",
    output: "Respond with vivid, descriptive language. Offer multiple creative alternatives. Be playful yet professional.",
    examples: "User: I need ideas for a sci-fi story set underwater.\nCreative: How about a civilization that evolved in the deep ocean trenches, developing bioluminescent technology instead of electronics?"
  }
};

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ className }) => {
  const [activeTemplate, setActiveTemplate] = useState<string>("assistant");
  const [formState, setFormState] = useState<PromptTemplate>(PRESET_TEMPLATES.assistant);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");

  useEffect(() => {
    generatePrompt();
  }, [formState]);

  const handleTemplateChange = (template: string) => {
    setActiveTemplate(template);
    setFormState(PRESET_TEMPLATES[template]);
  };

  const handleInputChange = (field: keyof PromptTemplate, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePrompt = () => {
    let prompt = "";
    
    if (formState.role) {
      prompt += `# Role\n${formState.role}\n\n`;
    }
    
    if (formState.goal) {
      prompt += `# Goal\n${formState.goal}\n\n`;
    }
    
    if (formState.constraints) {
      prompt += `# Constraints\n${formState.constraints}\n\n`;
    }
    
    if (formState.guidelines) {
      prompt += `# Guidelines\n${formState.guidelines}\n\n`;
    }
    
    if (formState.output) {
      prompt += `# Output Format\n${formState.output}\n\n`;
    }
    
    if (formState.examples) {
      prompt += `# Examples\n${formState.examples}\n\n`;
    }
    
    setGeneratedPrompt(prompt.trim());
  };

  return (
    <div className={cn("container mx-auto px-4 py-8", className)}>
      <div className="flex flex-col space-y-8 md:flex-row md:space-y-0 md:space-x-8">
        <div className="w-full md:w-1/2">
          <div className="mb-8 animate-slide-down">
            <h2 className="text-xl font-medium mb-4">Presets</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRESET_TEMPLATES).map(([key, template]) => (
                <Button
                  key={key}
                  variant={activeTemplate === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTemplateChange(key)}
                  className="transition-all duration-200"
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-xl glass-panel">
            <h2 className="text-xl font-medium mb-6">Prompt Components</h2>
            
            <PromptField
              label="Role"
              name="role"
              value={formState.role}
              onChange={(value) => handleInputChange("role", value)}
              placeholder="Describe the AI's role and identity"
              helperText="Define who the AI is and what expertise it has"
            />
            
            <PromptField
              label="Goal"
              name="goal"
              value={formState.goal}
              onChange={(value) => handleInputChange("goal", value)}
              placeholder="What should the AI help accomplish?"
              helperText="The primary objective or purpose of the AI"
            />
            
            <PromptField
              label="Constraints"
              name="constraints"
              value={formState.constraints}
              onChange={(value) => handleInputChange("constraints", value)}
              placeholder="What boundaries should the AI have?"
              helperText="Limitations, restrictions, or boundaries for the AI"
              multiline
            />
            
            <PromptField
              label="Guidelines"
              name="guidelines"
              value={formState.guidelines}
              onChange={(value) => handleInputChange("guidelines", value)}
              placeholder="How should the AI approach tasks?"
              helperText="Instructions on methodology, approach, or reasoning"
              multiline
            />
            
            <PromptField
              label="Output Format"
              name="output"
              value={formState.output}
              onChange={(value) => handleInputChange("output", value)}
              placeholder="How should responses be structured?"
              helperText="Instructions on style, tone, format of responses"
              multiline
            />
            
            <PromptField
              label="Examples"
              name="examples"
              value={formState.examples}
              onChange={(value) => handleInputChange("examples", value)}
              placeholder="Sample exchanges to demonstrate desired behavior"
              helperText="Demonstrate with examples how the AI should respond"
              multiline
            />
          </div>
        </div>
        
        <div className="w-full md:w-1/2">
          <PromptPreview prompt={generatedPrompt} className="sticky top-24" />
        </div>
      </div>
    </div>
  );
};

export default PromptGenerator;
