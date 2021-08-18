#!/usr/bin/env python
# coding: utf-8

# In[1]:


get_ipython().system('pip install quandl')


# In[3]:


import quandl
quandl.ApiConfig.api_key = '38VWdHpGVLZs94hZCMC1'


# In[4]:


data = quandl.get("WIKI/AAPL")
data


# In[10]:


data.size


# In[11]:


data.info


# In[12]:


data.head(10)


# In[13]:


data.tail(10)


# In[14]:


data['Close']


# In[15]:


data['Close'].head(50)


# In[16]:


data.plot.line()


# In[17]:


data['Close'].plot.line()


# In[19]:


data['Open'].plot.line()


# In[16]:


import numpy as np
import pandas as pd


# In[4]:





# In[5]:


data = quandl.get("WIKI/AAPL")
data


# In[2]:


dataTwo = quandl.get("WIKI/FB")
dataTwo


# In[23]:


dataThree = {'Stock': ['Apple',  'Facebook'],

'Open': [data['Open'].head(1).values[0],  dataTwo['Open'].head(1).values[0]],

'Close': [data['Close'].head(1).values[0], dataTwo['Close'].head(1).values[0]]}
df = pd.DataFrame(dataThree,columns=['Stock',  'Open',  'Close'])
df


# In[21]:


data['Open'].values[1]


# In[24]:


dataTwo.std()


# In[25]:


dataTwo['Open'].std()


# In[5]:


dataFour = quandl.get_table('ZACKS/FC', paginate=True, ticker=['AAPL', 'MSFT'], per_end_date={'gte': '2015-01-01'}, qopts={'columns':['ticker', 'per_end_date']})
dataFour


# In[9]:


mydata = quandl.get(["NSE/OIL", "WIKI/AAPL", "FRED/FB", "WIKI/MSFT"])
mydata


# In[10]:


dataMSFT = quandl.get("WIKI/MSFT")


# In[11]:


dataAAPL = quandl.get("WIKI/AAPL")


# In[13]:


dataOIL = quandl.get("NSE/OIL")


# In[14]:


dataFB = quandl.get("WIKI/FB")


# In[18]:


result = pd.concat([dataMSFT, dataAAPL, dataOIL, dataFB], axis=1, join="inner")
result


# In[19]:


result.columns


# In[20]:


frames = [dataOIL, dataMSFT, dataAAPL, dataFB]


# In[22]:


result = pd.concat(frames)
result


# In[36]:


batchOne = pd.merge(dataAAPL, dataOIL, on="Date", suffixes = (': AAPL', ': OIL'))


# In[37]:


batchOne = pd.merge(batchOne, dataFB, on="Date", suffixes = ('', ': FB'))


# In[39]:


batchOne = pd.merge(batchOne, dataMSFT, on="Date", suffixes = ('', ': MSFT'))
batchOne.columns


# In[ ]:




