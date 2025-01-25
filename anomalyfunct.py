import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
import matplotlib.pyplot as plt

def detect_spending_anomalies(file_path):
    # Read and prepare data
    df = pd.read_csv(file_path)
    df['Date'] = pd.to_datetime(df['Date'])
    df.set_index('Date', inplace=True)
    
    # Calculate total monthly spending
    expense_columns = [col for col in df.columns if not col.startswith('Income')]
    df['total_spending'] = df[expense_columns].sum(axis=1)
    
    model = ARIMA(df['total_spending'], order=(1, 1, 1))
    model_fit = model.fit()
    
    # Get residuals and calculate threshold
    residuals = model_fit.resid
    threshold = 2 * residuals.std()
    
    # Identify anomalies
    anomalies = df[abs(residuals) > threshold].copy()
    anomalies['residual'] = residuals[abs(residuals) > threshold]
    anomalies['deviation_percent'] = (anomalies['residual'] / anomalies['total_spending'] * 100).round(2)
    
    # Analyze category-specific anomalies
    category_anomalies = {}
    for category in expense_columns:
        category_mean = df[category].mean()
        category_std = df[category].std()
        category_threshold = 2 * category_std
        
        category_outliers = df[abs(df[category] - category_mean) > category_threshold]
        if not category_outliers.empty:
            category_anomalies[category] = {
                'dates': category_outliers.index.strftime('%Y-%m-%d').tolist(),
                'values': category_outliers[category].tolist(),
                'normal_range': f"${category_mean - category_threshold:.2f} to ${category_mean + category_threshold:.2f}"
            }
    
    return {
        'total_spending_anomalies': {
            'dates': anomalies.index.strftime('%Y-%m-%d').tolist(),
            'amounts': anomalies['total_spending'].tolist(),
            'deviation_percent': anomalies['deviation_percent'].tolist()
        },
        'category_anomalies': category_anomalies
    }