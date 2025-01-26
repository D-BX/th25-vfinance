import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from sklearn.ensemble import RandomForestRegressor

class DisasterImpactPredictor:
    def __init__(self):
        self.disaster_risks = {
            'California': ['earthquake', 'wildfire'],
            'Florida': ['hurricane', 'flood'],
            'Texas': ['tornado', 'flood'],
            'New York': ['blizzard', 'flood'],
            'Colorado': ['wildfire', 'blizzard']
        }    
        self.disaster_impacts = {
            'earthquake': {
                'duration': 6, 
                'housing_impact': 0.8, 
                'utilities_impact': 0.5,
                'emergency_expenses': 15000
            },
            'wildfire': {
                'duration': 4,
                'housing_impact': 0.6,
                'utilities_impact': 0.4,
                'emergency_expenses': 10000
            },
            'hurricane': {
                'duration': 5,
                'housing_impact': 0.7,
                'utilities_impact': 0.6,
                'emergency_expenses': 12000
            },
            'flood': {
                'duration': 3,
                'housing_impact': 0.5,
                'utilities_impact': 0.3,
                'emergency_expenses': 8000
            },
            'tornado': {
                'duration': 2,
                'housing_impact': 0.4,
                'utilities_impact': 0.3,
                'emergency_expenses': 7000
            },
            'blizzard': {
                'duration': 1,
                'housing_impact': 0.2,
                'utilities_impact': 0.7,
                'emergency_expenses': 5000
            }
        }

    def analyze_financial_preparedness(self, df, location):
        # Get potential disasters for location
        potential_disasters = self.disaster_risks.get(location, ['flood', 'fire'])  # default risks
        
        # Calculate current financial metrics
        monthly_income = df[['Income (Salary)', 'Income (Investments)', 'Income (Side Hustles)']].sum(axis=1).mean()
        monthly_expenses = df[['Rent/Mortgage', 'Utilities', 'Groceries', 'Transportation']].sum(axis=1).mean()
        emergency_fund = df['Emergency Fund Contributions'].sum()
        
        recommendations = []
        for disaster in potential_disasters:
            impact = self.disaster_impacts[disaster]
            
            # Calculate financial impact
            additional_monthly_cost = (
                df['Rent/Mortgage'].mean() * impact['housing_impact'] +
                df['Utilities'].mean() * impact['utilities_impact'] +
                impact['emergency_expenses'] / impact['duration']
            )
            
            # Calculate required emergency fund
            required_fund = additional_monthly_cost * impact['duration']
            
            # Generate recommendations
            if emergency_fund < required_fund:
                shortfall = required_fund - emergency_fund
                monthly_savings_needed = shortfall / 12
                
                recommendations.append({
                    'disaster_type': disaster,
                    'duration_months': impact['duration'],
                    'total_cost': round(required_fund, 2),
                    'current_preparedness': round(emergency_fund / required_fund * 100, 1),
                    'additional_savings_needed': round(monthly_savings_needed, 2),
                    'suggested_budget_cuts': self.suggest_budget_cuts(df, monthly_savings_needed)
                })
        
        return recommendations

    def suggest_budget_cuts(self, df, target_savings):
        discretionary_categories = [
            'Entertainment', 'Dining Out', 'Travel', 
            'Miscellaneous Expenses', 'Subscriptions'
        ]
        
        current_spending = {}
        suggested_cuts = {}
        
        for category in discretionary_categories:
            monthly_avg = df[category].mean()
            current_spending[category] = monthly_avg
            
            # Suggest larger cuts from larger expense categories
            suggested_cut = min(monthly_avg * 0.5, target_savings * (monthly_avg / sum(current_spending.values())))
            suggested_cuts[category] = round(suggested_cut, 2)
            
        return suggested_cuts

def predict_disaster_impact(file_path, location):
    df = pd.read_csv(file_path)
    predictor = DisasterImpactPredictor()
    return predictor.analyze_financial_preparedness(df, location)