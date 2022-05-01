import tensorflow as tf

class Mimic(tf.keras.Model):
    def __init__(self, args):
        super(Mimic, self).__init__(name=str(args["name"]))
        self.structure = [int(x) for x in args["structure"]]
        self.kind = str(args["kind"])
        self.nOutputs = int(args["nOutputs"])
        self.activation = str(args["activation"])
        pass

    def build(self, inputs_shape):
        self.Layers = []
        self.Layers.append(tf.keras.layers.InputLayer(inputs_shape=inputs_shape[1:]))
        for items in self.structure:
            if self.kind == "perceptron":
                self.Layers.append(tf.keras.layers.Dense(items, activation=self.activation))
        self.Layers.append(tf.keras.layers.Dense(self.nOutputs, activation="tanh"))
        pass

    def call(self, inputs, args):
        for index, _ in enumerate(self.Layers):
            if index == 0:
                outputs = self.Layers[index](inputs)
            else:
                if self.kind == "perceptron":
                    outputs = self.Layers[index](outputs)
        return outputs