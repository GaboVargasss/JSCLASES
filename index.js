const csvUrl = "https://raw.githubusercontent.com/rudyluis/PROGDAEM/refs/heads/main/Dashboard/DatosTecnologicos.csv";
let allData=[];

$(document).ready(function() {
    $.ajax({
        url: csvUrl,
        dataType: 'text',
        success: function(data) {
            parsed = Papa.parse(data, {header: true});

            allData = parsed.data.filter(d => d.pais); 
            console.log(allData);

            popularFiltros();
            aplicarFiltrosYGraficos();
        }
    });
    $('#filterPais, #filterCiudad, #filterAnio, #filterCategoria').on('change', function () {
        popularFiltros();        // actualizar opciones según selección
        aplicarFiltrosYGraficos(); // actualizar datos mostrados
    });
});

function popularFiltros(){
    const paisSel = $('#filterPais').val();
    const ciudadSel = $('#filterCiudad').val();
    const anioSel = $('#filterAnio').val();
    const catSel = $('#filterCategoria').val();

    const filtrado = allData.filter(d =>
        (!paisSel || d.pais === paisSel) &&
        (!ciudadSel || d.ciudad === ciudadSel) &&
        (!anioSel || d.anio === anioSel) &&
        (!catSel || d.categoría === catSel)
      );
    
    const unique = (arr, key) => [...new Set(arr.map(d => d[key]).filter(Boolean))].sort();
    
    const actualizarCombo = (id, valores) => {
        const select = $(id);             // Obtener el select por ID
        const valorActual = select.val(); // Guardar el valor actualmente seleccionado
        select.empty().append(`<option value="">Todos</option>`); // Reiniciar opciones con "Todos" como opción inicial
        valores.forEach(v => select.append(`<option value="${v}">${v}</option>`)); // Agregar nuevas opciones
        if (valores.includes(valorActual)) select.val(valorActual); // Restaurar selección si aún es válida
    };
    
    actualizarCombo('#filterPais', unique(filtrado, 'pais'));
    actualizarCombo('#filterCiudad', unique(filtrado, 'ciudad'));
    actualizarCombo('#filterAnio', unique(filtrado, 'anio'));
    actualizarCombo('#filterCategoria', unique(filtrado, 'categoría'));

    $('#filterPais, #filterCiudad, #filterAnio, #filterCategoria').on('change', function () {
        popularFiltros();        // actualizar opciones según selección
        aplicarFiltrosYGraficos(); // actualizar datos mostrados
    });
}

function aplicarFiltrosYGraficos(){
    const pais = $('#filterPais').val();
    const ciudad = $('#filterCiudad').val();
    const anio = $('#filterAnio').val();
    const categoria = $('#filterCategoria').val();
  
   
    const filtrado = allData.filter(d =>
      (!pais || d.pais === pais) &&
      (!ciudad || d.ciudad === ciudad) &&
      (!anio || d.anio === anio) &&
      (!categoria || d.categoría === categoria)
    );

    cargarTabla(filtrado);
  
    renderGraficos(filtrado);
}

function cargarTabla(data){

   const tabla = $('#tablaDatos').DataTable();
   tabla.clear().destroy();

   const cuerpo = data.map(d => [
    d.orden, d.anio, d.mes, d.dia, d.fecha,
    d.pais, d.ciudad, d.categoría, d.producto,
    d.precio, d.util_porcent, d.Cantidad, d.Total, d.utilidad
  ]);

  $('#tablaDatos').DataTable({
    data: cuerpo, // datos ya transformados
    columns: [
      { title: "Orden" },
      { title: "Año" },
      { title: "Mes" },
      { title: "Día" },
      { title: "Fecha" },
      { title: "País" },
      { title: "Ciudad" },
      { title: "Categoría" },
      { title: "Producto" },
      {
        title: "Precio"
      },
      {
        title: "% Utilidad",          // Columna de porcentaje de utilidad
        className: "text-end",
        render: function (data) {
          return parseFloat(data).toFixed(2);
        }
      },
      {
        title: "Cantidad",            // Cantidad vendida
        className: "text-end",
        render: function (data) {
          return parseFloat(data).toFixed(2);
        }
      },
      {
        title: "Total",               // Total de venta
        className: "text-end",
        render: function (data) {
          return parseFloat(data).toFixed(2);
        }
      },
      {
        title: "Utilidad",            // Utilidad monetaria
        className: "text-end",
        render: function (data) {
          return parseFloat(data).toFixed(2);
        }
      }
    ],
    responsive: true // Hace que la tabla sea adaptable a distintos tamaños de pantalla
  });
}

function renderGraficos(data){
    ['ventasPorPais', 'ventasPorCategoria', 'ventasPorFecha', 'graficoRadar', 'graficoDoughnut'].forEach(id => {
        Chart.getChart(id)?.destroy();
      });
   
    /*Chart.getChart('ventasPorPais')?.destroy();
    Chart.getChart('ventasPorCategoria')?.destroy();
    Chart.getChart('ventasPorFecha')?.destroy();
    Chart.getChart('graficoRadar')?.destroy();
    Chart.getChart('graficoDoughnut')?.destroy();*/
    const ventasPais = {}, ventasCategoria = {}, ventasFecha = {}, radarData = {}, doughnutData = {};
     
    data.forEach(d => {
        const pais = d.pais;
        const cat = d.categoría;
        const fecha = d.fecha;
        const ciudad = d.ciudad;
        const total = parseFloat(d.Total || 0);
    
        ventasPais[pais] = (ventasPais[pais] || 0) + total;
        ventasCategoria[cat] = (ventasCategoria[cat] || 0) + total;
        ventasFecha[fecha] = (ventasFecha[fecha] || 0) + total;
        radarData[ciudad] = (radarData[ciudad] || 0) + total;
        doughnutData[cat] = (doughnutData[cat] || 0) + total;
    });

    new Chart(document.getElementById('ventasPorPais'), {
        type: 'bar',
        data: {
          labels: Object.keys(ventasPais),
          datasets: [{
            label: 'Total de Ventas por País',
            data: Object.values(ventasPais),
            backgroundColor: 'rgb(255, 153, 0)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
    });
    
    new Chart(document.getElementById('ventasPorCategoria'), {
      type: 'pie',
      data: {
        labels: Object.keys(ventasCategoria),
        datasets: [{
          label: 'Ventas por Categoría',
          data: Object.values(ventasCategoria),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
            '#C9CBCF', '#8E44AD', '#2ECC71', '#F39C12' // puedes agregar más colores si hay más categorías
          ],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribución de Ventas por Categoría',
            font: {
              size: 18
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.label || '';
                let value = context.raw || 0;
                let total = context.dataset.data.reduce((a, b) => a + b, 0);
                let percentage = ((value / total) * 100).toFixed(2);
                return '${label}: ${value.toLocaleString()} (${percentage}%)';
              }
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 20,
              font: {
                size: 12
              }
            }
          }
        }
     }
    });
  const fechasOrdenadas = Object.keys(ventasFecha).sort();
  new Chart(document.getElementById('ventasPorFecha'), {
    type: 'line',
    data: {
      labels: fechasOrdenadas,
      datasets: [{
        label: 'Ventas en el Tiempo',
        data: fechasOrdenadas.map(f => ventasFecha[f]),
        fill: false,
        borderColor: 'rgb(255, 102, 0)',
        tension: 0.1
      }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
      }
  });
  new Chart(document.getElementById('graficoRadar'), {
    type: 'radar',
    data: {
      labels: Object.keys(radarData),
      datasets: [{
        label: 'Ventas por Ciudad',
        data: Object.values(radarData),
        backgroundColor: 'rgb(255, 255, 153)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Ventas por Ciudad',
          font: {
            size: 18
          }
        }
      }
    }
  });
  new Chart(document.getElementById('graficoDoughnut'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(doughnutData),
      datasets: [{
        label: 'Distribución por Categoría',
        data: Object.values(doughnutData),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
          '#C9CBCF', '#8E44AD', '#2ECC71', '#F39C12' // Colores adicionales por si hay más categorías
        ],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%', // Grosor del centro del doughnut (más o menos hueco)
      plugins: {
        title: {
          display: true,
          text: 'Distribución por Categoría',
          font: {
            size: 18
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(2);
              return '${label}: ${value.toLocaleString()} (${percentage}%);'
            }
          }
        },
        legend: {
          position: 'bottom',
          labels: {
            font: {
              size: 12
            }
          }
        }
      }
    }
  });
}


$('#toggleTheme').on('click', function() {
    const html = document.documentElement;
    console.log(html);
    const isDark = html.getAttribute('data-bs-theme') === 'dark';
    html.setAttribute('data-bs-theme', isDark ? 'light' : 'dark');
    this.textContent = isDark ? 'Modo Claro 🌞' : 'Modo Oscuro 🌙';
});