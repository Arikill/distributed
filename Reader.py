import pandas as pd
import numpy as np
from requests import head

def read_txt(filename):
    data = pd.read_csv(filename, nrows=1)
    return data.columns[0].replace('"', '').split("\t")
