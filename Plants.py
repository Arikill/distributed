import numpy as np
import matplotlib.pyplot as plt

class RCcircuit:
    def __init__(self, R:float=1, C:float=0.001) -> None:
        self.R = R
        self.C = C
        self.built = False
        pass
    
    def set_R(self, R):
        self.R = R
        pass

    def set_C(self, C):
        self.C = C
        pass

    def __call__(self, V, I, Fs):
        return V + (1/Fs)*(1/self.C)*(I - (1/self.R)*(V))

if __name__ == "__main__":
    Fs = 1e4
    tstart = 0.0
    tend = 1.0
    ntimesteps = int(Fs*(tend-tstart))
    nbatches = 1
    t = np.reshape(np.linspace(tstart, tend, ntimesteps, dtype=np.float32), (1, ntimesteps))
    V = np.zeros((nbatches, ntimesteps, 1), dtype=np.float32)
    R = 1
    C = 0.01
    I = np.zeros((nbatches, ntimesteps, 1), dtype=np.float32)
    I[:, 2000:4000, :] = 1
    rc = RCcircuit(R, C)
    for sample in range(1, ntimesteps):
        V[:, sample, :] = rc(V[:, sample-1, :], I[:, sample-1, :], Fs)
    print(V)
    fig = plt.figure()
    plt.plot(t[0, :], V[0, :, 0])
    plt.show()