<script>
  new gridjs.Grid({
    columns: ["TIPO", "CLIENTE", "MOTIVO", "GENERADA", "PRIORIDAD", "ESTATUS"],
    data: [
      /* You can use EJS to inject your mock data here */
      <% tableData.forEach(row => { %>
        ["<%= row.tipo %>", "<%= row.cliente %>", "<%= row.motivo %>", "<%= row.fecha %>", "<%= row.prioridad %>", "<%= row.estatus %>"],
      <% }) %>
    ],
    search: true,    // Adds a search bar automatically
    sort: true,      // Allows clicking headers to sort
    pagination: {
      limit: 5       // Limits rows per page
    },
    style: {
      table: {
        'font-family': 'Cambria, serif' // Matches your brand identity
      },
      th: {
        'background-color': '#4d0100', // Your --primary-color
        'color': 'white'
      }
    }
  }).render(document.getElementById("wrapper"));
</script>