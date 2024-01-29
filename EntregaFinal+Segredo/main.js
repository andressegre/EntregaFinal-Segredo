const storageManager = {
    guardarEnStorage: function (clave, valor) {
        const valorJSON = JSON.stringify(valor);
        localStorage.setItem(clave, valorJSON);
    },
    recuperarDeStorage: function (clave) {
        const valorJSON = localStorage.getItem(clave);
        return valorJSON ? JSON.parse(valorJSON) : null;
    },
};

const app = new Vue({
    el: '#app',
    data: {
        monto: 0,
        tasa: 0,
        plazo: 0,
        cuotaMensual: 0,
        totalPrestamo: 0,
        dolar: 0,
    },
    methods: {
        capturarEntradas() {
            return { monto: parseFloat(this.monto), tasa: parseFloat(this.tasa), plazo: parseInt(this.plazo) };
        },
        calcularPrestamo() {
            const { monto, tasa, plazo } = this.capturarEntradas();

            if (isNaN(monto) || isNaN(tasa) || isNaN(plazo) || monto <= 0 || tasa <= 0 || plazo <= 0) {
                // Reemplaza el alert por SweetAlert2
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Por favor, ingrese valores válidos para el monto, la tasa y el plazo.',
                });
                return;
            }

            const tasaInteresMensual = tasa / 100 / 12;
            this.cuotaMensual = (monto * tasaInteresMensual) / (1 - Math.pow(1 + tasaInteresMensual, -plazo));
            this.totalPrestamo = this.cuotaMensual * plazo;

            this.mostrarResultado();
            this.obtenerValorDolar();
            this.reproducirSonido();
        },
        mostrarResultado() {
            storageManager.guardarEnStorage("ultimaCuota", this.cuotaMensual);
            storageManager.guardarEnStorage("totalPrestamo", this.totalPrestamo);
        },
        obtenerValorDolar() {
            fetch('http://localhost:3000/getDolarValue')
                .then(response => response.json())
                .then(data => {
                    this.dolar = data.usd;
                })
                .catch(error => {
                    console.error('Error al obtener valor del dólar:', error);
                });
        },
        cargarDatosGuardados() {
            const ultimaCuota = storageManager.recuperarDeStorage("ultimaCuota");
            const totalPrestamo = storageManager.recuperarDeStorage("totalPrestamo");

            if (ultimaCuota && totalPrestamo) {
                this.cuotaMensual = ultimaCuota;
                this.totalPrestamo = totalPrestamo;
            }
        },
        reproducirSonido() {
            // Puedes ajustar la ruta del sonido según su ubicación en tu proyecto
            const audio = new Audio('./audio/caja.mp3');
            audio.play();
        },
    },
    mounted() {
        this.cargarDatosGuardados();
        this.obtenerValorDolar();
    },
});
