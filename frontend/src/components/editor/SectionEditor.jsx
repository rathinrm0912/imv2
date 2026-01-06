import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

const SectionEditor = ({ section, onUpdate }) => {
  const [content, setContent] = useState(section.content || {});
  const [showInstructions, setShowInstructions] = useState(section.show_instructions !== false);

  useEffect(() => {
    setContent(section.content || {});
    setShowInstructions(section.show_instructions !== false);
  }, [section]);

  const handleFieldChange = (fieldKey, value) => {
    const updated = { ...content, [fieldKey]: value };
    setContent(updated);
    onUpdate({ ...section, content: updated });
  };

  const toggleInstructions = () => {
    const newValue = !showInstructions;
    setShowInstructions(newValue);
    onUpdate({ ...section, show_instructions: newValue });
  };

  // Render different field types based on section
  const renderFields = () => {
    switch (section.section_id) {
      case 'exec_summary':
        return (
          <div className="space-y-4">
            <div>
              <Label>Company Brand</Label>
              <Input
                value={content.company_brand || ''}
                onChange={(e) => handleFieldChange('company_brand', e.target.value)}
                placeholder="Mention the name of the product line"
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>Registered Name</Label>
              <Input
                value={content.registered_name || ''}
                onChange={(e) => handleFieldChange('registered_name', e.target.value)}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>Nature of Company</Label>
              <Input
                value={content.nature || ''}
                onChange={(e) => handleFieldChange('nature', e.target.value)}
                placeholder="Pvt Ltd/Partnership/Proprietorship"
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>Address</Label>
              <Textarea
                value={content.address || ''}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                placeholder="Registered Address and Communication Address"
                rows={3}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={content.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="SPOC Email ID"
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>Business Summary</Label>
              <Textarea
                value={content.business_summary || ''}
                onChange={(e) => handleFieldChange('business_summary', e.target.value)}
                placeholder="Core model, products/services, target market, unique value proposition"
                rows={5}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>Investment Rationale (Brief)</Label>
              <Textarea
                value={content.investment_rationale || ''}
                onChange={(e) => handleFieldChange('investment_rationale', e.target.value)}
                placeholder="Key reasons for investment"
                rows={4}
                className="rounded-sm"
              />
            </div>
          </div>
        );

      case 'business_overview':
        return (
          <div className="space-y-4">
            <div>
              <Label>Problem Statement</Label>
              <Textarea
                value={content.problem || ''}
                onChange={(e) => handleFieldChange('problem', e.target.value)}
                placeholder="Describe the problem in 1-2 lines"
                rows={3}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>Background to the Problem</Label>
              <Textarea
                value={content.background || ''}
                onChange={(e) => handleFieldChange('background', e.target.value)}
                placeholder="Context, origins, significance, and challenges"
                rows={5}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>Solution Overview</Label>
              <Textarea
                value={content.solution || ''}
                onChange={(e) => handleFieldChange('solution', e.target.value)}
                placeholder="Key features and benefits of the solution"
                rows={5}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>Business Model</Label>
              <Textarea
                value={content.business_model || ''}
                onChange={(e) => handleFieldChange('business_model', e.target.value)}
                placeholder="Revenue streams, cost structure, pricing strategy"
                rows={5}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>Technology Summary</Label>
              <Textarea
                value={content.technology || ''}
                onChange={(e) => handleFieldChange('technology', e.target.value)}
                placeholder="Technology stack, scalability, innovation"
                rows={4}
                className="rounded-sm"
              />
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-4">
            <div>
              <Label>Funds Raised So Far</Label>
              <Textarea
                value={content.funds_raised || ''}
                onChange={(e) => handleFieldChange('funds_raised', e.target.value)}
                placeholder="Total amount, sources, allocation"
                rows={3}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>Revenue (FY 24) in ₹</Label>
              <Input
                value={content.revenue_fy24 || ''}
                onChange={(e) => handleFieldChange('revenue_fy24', e.target.value)}
                placeholder="Enter amount"
                className="rounded-sm font-mono"
              />
            </div>
            <div>
              <Label>EBITDA (FY 24) in ₹</Label>
              <Input
                value={content.ebitda_fy24 || ''}
                onChange={(e) => handleFieldChange('ebitda_fy24', e.target.value)}
                placeholder="Enter amount"
                className="rounded-sm font-mono"
              />
            </div>
            <div>
              <Label>P&L Insights</Label>
              <Textarea
                value={content.pl_insights || ''}
                onChange={(e) => handleFieldChange('pl_insights', e.target.value)}
                placeholder="Key insights from profit and loss statement"
                rows={5}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>Balance Sheet Insights</Label>
              <Textarea
                value={content.bs_insights || ''}
                onChange={(e) => handleFieldChange('bs_insights', e.target.value)}
                placeholder="Key insights from balance sheet"
                rows={5}
                className="rounded-sm"
              />
            </div>
          </div>
        );

      case 'market':
        return (
          <div className="space-y-4">
            <div>
              <Label>Indian Market Overview</Label>
              <Textarea
                value={content.indian_market || ''}
                onChange={(e) => handleFieldChange('indian_market', e.target.value)}
                placeholder="Market segments, size, and CAGR"
                rows={4}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>Global Market Overview</Label>
              <Textarea
                value={content.global_market || ''}
                onChange={(e) => handleFieldChange('global_market', e.target.value)}
                placeholder="Market segments, size, and CAGR"
                rows={4}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>TAM (Total Addressable Market)</Label>
              <Input
                value={content.tam || ''}
                onChange={(e) => handleFieldChange('tam', e.target.value)}
                placeholder="Market size in USD"
                className="rounded-sm font-mono"
              />
            </div>
            <div>
              <Label>SAM (Serviceable Addressable Market)</Label>
              <Input
                value={content.sam || ''}
                onChange={(e) => handleFieldChange('sam', e.target.value)}
                placeholder="Market size in USD"
                className="rounded-sm font-mono"
              />
            </div>
            <div>
              <Label>SOM (Serviceable Obtainable Market)</Label>
              <Input
                value={content.som || ''}
                onChange={(e) => handleFieldChange('som', e.target.value)}
                placeholder="Market size in USD"
                className="rounded-sm font-mono"
              />
            </div>
            <div>
              <Label>Competition Analysis</Label>
              <Textarea
                value={content.competition || ''}
                onChange={(e) => handleFieldChange('competition', e.target.value)}
                placeholder="Indian and global competitors"
                rows={6}
                className="rounded-sm"
              />
            </div>
          </div>
        );

      case 'risk':
        return (
          <div className="space-y-4">
            <div>
              <Label>Market Risk</Label>
              <Textarea
                value={content.market_risk || ''}
                onChange={(e) => handleFieldChange('market_risk', e.target.value)}
                placeholder="Competition, demand fluctuations, customer behavior"
                rows={4}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>Operational Risk</Label>
              <Textarea
                value={content.operational_risk || ''}
                onChange={(e) => handleFieldChange('operational_risk', e.target.value)}
                placeholder="Scalability, operational challenges, resource constraints"
                rows={4}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>Financial Risk</Label>
              <Textarea
                value={content.financial_risk || ''}
                onChange={(e) => handleFieldChange('financial_risk', e.target.value)}
                placeholder="Cash flow, funding, cost management"
                rows={4}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label>Regulatory Risk</Label>
              <Textarea
                value={content.regulatory_risk || ''}
                onChange={(e) => handleFieldChange('regulatory_risk', e.target.value)}
                placeholder="Legal changes, compliance requirements"
                rows={4}
                className="rounded-sm"
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <Label>Content</Label>
            <Textarea
              value={content.text || ''}
              onChange={(e) => handleFieldChange('text', e.target.value)}
              placeholder="Enter section content..."
              rows={10}
              className="rounded-sm"
            />
          </div>
        );
    }
  };

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-mono text-muted-foreground">{section.section_number}</span>
            <h2 className="text-2xl font-bold">{section.title}</h2>
          </div>
          {section.instructions && showInstructions && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {section.instructions}
              </AlertDescription>
            </Alert>
          )}
        </div>
        {section.instructions && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleInstructions}
            className="rounded-sm"
            data-testid="toggle-instructions"
          >
            {showInstructions ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="ml-2">{showInstructions ? 'Hide' : 'Show'} Instructions</span>
          </Button>
        )}
      </div>

      <div className="bg-card border border-border rounded-sm p-6">
        {renderFields()}
      </div>
    </div>
  );
};

export default SectionEditor;