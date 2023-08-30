import './App.css';
import { useEffect, useState } from 'react';
import Web3 from 'web3';

import smartContractRegistro from './contrato.json';

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
        const taskCounter = await contract.methods.taskCounter().call();

        let arrayTarea = [];

        for (let i = 0; i <= taskCounter; i++) {
          const infotarea = await contract.methods.tasks(i).call();

          if (infotarea.title != "") {
            const tarea = {
              title: infotarea.title,
              creatAtl: infotarea.creatAtl,
              id: infotarea.id,
              description: infotarea.description,
              done: infotarea.done,
            };
            //console.log(tarea);
            arrayTarea.push(tarea);
          }
        };
        //console.log(arrayTarea);
        setListarInformacion(arrayTarea);

      } catch (error) {
        console.error('Error al actualizar valor:', error);
      }
    }
  };

  useEffect(() => { ListarRegistros(); }, [contract]);

  useEffect(() => {
    async function Wallet() {
      if (typeof window.ethereum !== 'undefined') {
        console.log("Wallet: SI.");
        setMetamask(true);
      } else {
        console.log("Wallet: NO");
      }
    };
    Wallet();
  }, []);


  const conectarWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {

      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      try {
        await window.ethereum.enable();

        const accounts = await web3Instance.eth.getAccounts();
        const account = accounts[0];//setea
        //console.log(accounts[0]);

        setAccount(accounts[0]);

        const balanceWei = await web3Instance.eth.getBalance(accounts[0]);
        const balanceEth = web3Instance.utils.fromWei(balanceWei, 'ether');
        //console.log(balanceEth);

        setBalance(balanceEth);

        const contractInstance = new web3Instance.eth.Contract(
          smartContractRegistro,
          smartContractRegistro && "0x0A3905Ce2351d5FE54264D5ae1282AEbec4cB692"
        );
        setContract(contractInstance);
        //console.log("contractInstance ==>", contractInstance);

      } catch (error) {
        console.error(error);
      };
    } else {
      setMetamask(false);
    };
  };



  const estadoInicialFormulario = {
    title: "",
    description: "",
  };

  const registrarInformacion = async (e) => {
    e.preventDefault();
    //console.log(formulario);

    try {
      const result = await contract.methods.createTask(formulario.title, formulario.description,).send({ from: account });
      //console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  const ManejarFormulario = ({ target: { name, value } }) => {

    setFormulario({ ...formulario, [name]: value });

  };

  const [formulario, setFormulario] = useState(estadoInicialFormulario);

  const cambioEstadoTarea = async (taskId) => {
    if (contract && account) {
      try {
        await contract.methods.cambioEstado(taskId).send({ from: account });
        ListarRegistros(); // Refresco
      } catch (error) {
        console.error('Error al cambiar estado:', error);
      }
    }
  };

  return (
    <div>
      <button onClick={conectarWallet} value={account}>Conectar wallet</button>
      <p>{balance}</p><p>{account}</p>

      <div className='contenedor'>
        <div className='box'>

          <form onSubmit={registrarInformacion} className="formulario">
            <h2>Tasks</h2>
            <input type="text" id="title" name="title" onChange={ManejarFormulario} value={formulario.title} required></input><br></br>
            <input type="text" id="description" name="description" onChange={ManejarFormulario} value={formulario.description} required></input><br></br>
            <button className="boton" type="submit">Enviar</button>
          </form>

          <table>
            <thead>
              <tr>
                <th>Estado</th>
                <th>Tarea</th>
                <th>Descripcion</th>
              </tr>
            </thead>
            <tbody>

              {ListarInformacion.map((item) => (
                
                  <tr key={item.id}>
                    <td><button onClick={() => cambioEstadoTarea(item.id)}>
                  {item.done ? 'Pendiente' : 'Completada'}
                </button></td>
                    <td><input name='title' placeholder={item.title} /></td>
                    <td><input name='description' placeholder={item.description} /></td>
                  </tr>
                
              ))}

            </tbody>
          </table>

        </div>
      </div>

    </div>
  );
}

export default App;
