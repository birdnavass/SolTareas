import "./App.css";
import { useEffect, useState } from "react";
import Web3 from "web3";

import smartContractRegistro from "./pos.json";

function App() {
  const [Metamask, setMetamask] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [contract, setContract] = useState();
  const [ListarInformacion, setListarInformacion] = useState([]);

  const ListarRegistros = async () => {
    if (contract) {
      try {
        const taskCounter = await contract.methods.contadorProductos().call();

        let arrayTarea = [];

        for (let i = 0; i <= taskCounter; i++) {
          const infotarea = await contract.methods.Productos(i).call();

          if (infotarea.nombre != "") {
            const tarea = {
              nombre: infotarea.nombre,
              descripcion: infotarea.descripcion,
              existencias: infotarea.existencias,
              caducidad: infotarea.caducidad,
              precio: infotarea.precio,
            };
            //console.log(tarea);
            arrayTarea.push(tarea);
          }
        }
        //console.log(arrayTarea);
        setListarInformacion(arrayTarea);
      } catch (error) {
        console.error("Error al actualizar valor:", error);
      }
    }
  };

  useEffect(() => {
    ListarRegistros();
  }, [contract]);

  useEffect(() => {
    async function Wallet() {
      if (typeof window.ethereum !== "undefined") {
        console.log("Wallet: SI.");
        setMetamask(true);
      } else {
        console.log("Wallet: NO");
      }
    }
    Wallet();
  }, []);

  const conectarWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      try {
        await window.ethereum.enable();

        const accounts = await web3Instance.eth.getAccounts();
        const account = accounts[0]; //setea
        //console.log(accounts[0]);

        setAccount(accounts[0]);

        const balanceWei = await web3Instance.eth.getBalance(accounts[0]);
        const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
        //console.log(balanceEth);

        setBalance(balanceEth);

        const contractInstance = new web3Instance.eth.Contract(
          smartContractRegistro,
          smartContractRegistro && "0xD6e6b2d290b343cd8B2A574FB0bF192E94D8A8e3"
        );
        setContract(contractInstance);
        //console.log("contractInstance ==>", contractInstance);
      } catch (error) {
        console.error(error);
      }
    } else {
      setMetamask(false);
    }
  };

  const estadoInicialFormulario = {
    nombre: "",
    descripcion: "",
    existencias: "",
    caducidad: "",
    precio: "",
  };

  const registrarInformacion = async (e) => {
    e.preventDefault();
    //console.log(formulario);

    try {
      const result = await contract.methods
        .agregarProducto(
          formulario.nombre,
          formulario.descripcion,
          formulario.existencias,
          formulario.caducidad,
          formulario.precio
        )
        .send({ from: account }); //console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  const ManejarFormulario = ({ target: { name, value } }) => {
    setFormulario({ ...formulario, [name]: value });
  };

  const [formulario, setFormulario] = useState(estadoInicialFormulario);

  // const cambioEstadoTarea = async (taskId) => {
  //   if (contract && account) {
  //     try {
  //       await contract.methods.cambioEstado(taskId).send({ from: account });
  //       ListarRegistros(); // Refresco
  //     } catch (error) {
  //       console.error('Error al cambiar estado:', error);
  //     }
  //   }
  // };
  console.log("props en listar registros =>", ListarInformacion);

  return (
    <div>
      <button onClick={conectarWallet} value={account}>
        Conectar wallet
      </button>
      <p>{balance}</p>
      <p>{account}</p>

      <div className="contenedor">
        <div className="box">
          <form onSubmit={registrarInformacion} className="formulario">
            <h2>Tasks</h2>

            <input
              type="text"
              id="nombre"
              name="nombre"
              onChange={ManejarFormulario}
              value={formulario.nombre}
              required
            ></input>
            <br></br>
            <input
              type="text"
              id="descripcion"
              name="descripcion"
              onChange={ManejarFormulario}
              value={formulario.descripcion}
              required
            ></input>
            <br></br>
            <input
              type="text"
              id="existencias"
              name="existencias"
              onChange={ManejarFormulario}
              value={formulario.existencias}
              required
            ></input>
            <br></br>
            <input
              type="text"
              id="caducidad"
              name="caducidad"
              onChange={ManejarFormulario}
              value={formulario.caducidad}
              required
            ></input>
            <br></br>
            <input
              type="text"
              id="precio"
              name="precio"
              onChange={ManejarFormulario}
              value={formulario.precio}
              required
            ></input>
            <br></br>
            <button className="boton" type="submit">
              Enviar
            </button>
          </form>

          <table className="tftable">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Tarea</th>
                <th>Descripcion</th>
              </tr>
            </thead>
            <tbody>
              {/* {ListarInformacion.map((item) => (
                <tr key={item.id}>
                  <td>
                    <button onClick={() => cambioEstadoTarea(item.id)}>
                      {item.done ? "Pendiente" : "Completada"}
                    </button>
                  </td>
                  <td>
                    <input name="title" placeholder={item.title} />
                  </td>
                  <td>
                    <input name="description" placeholder={item.description} />
                  </td>
                </tr>
              ))} */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
