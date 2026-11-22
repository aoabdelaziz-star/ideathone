import { AGENCIES, MODELS } from '@/data/seed';
import type { AgencyId, ForecastResult, ModelId } from '@/types';

const HISTORY_SHAPE = [0.44, 0.5, 0.49, 0.55, 0.58];

export function getModel(id: ModelId) {
  return MODELS.find((model) => model.id === id) ?? MODELS[0];
}

export function getAgencyName(id: AgencyId) {
  return AGENCIES.find((agency) => agency.id === id)?.name ?? AGENCIES[0].name;
}

export function forecast(
  modelId: ModelId,
  agencyId: AgencyId = 'all',
  priceChange = 0,
  translate?: (key: string) => string,
): ForecastResult {
  const model = getModel(modelId);
  const included = AGENCIES.filter((agency) => agency.id !== 'all' && (agencyId === 'all' || agency.id === agencyId));
  const factor = included.reduce((sum, agency) => sum + agency.factor, 0);
  const base = Math.round(model.baseUnits * factor);
  const demand = Math.round(base * (1 - 0.012 * priceChange));
  const price = Math.round(model.avgPartPrice * (1 + priceChange / 100));
  const revenue = Math.round(demand * price);

  return {
    base,
    demand,
    low: Math.round(demand * 0.88),
    high: Math.round(demand * 1.11),
    price,
    motoPrice: model.motoPrice,
    revenue,
    delta: Math.round((demand / base - 1) * 100),
    keyPart: model.keyPart,
    byAgency: included.map((agency) => ({
      id: agency.id,
      name: translate ? translate(agency.nameKey) : agency.name,
      demand: Math.round(model.baseUnits * agency.factor * (1 - 0.012 * priceChange)),
      history: HISTORY_SHAPE.map((ratio) => Math.round(model.baseUnits * agency.factor * ratio)),
    })),
  };
}
