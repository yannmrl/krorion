const productsGrid = document.getElementById('productsGrid');

const list =
[
    ["Sujet d'ALGO 2025", "sujetALGO25.txt"],
    ["Correction d'ALGO 2025", "correctionALGO25.c"],
    ["Sujet d'ALGO 2024", "sujetALGO24.txt"],
    ["Correction d'ALGO 2024", "correctionALGO24.c"]
]

function load_drive()
{
    renderProducts();
}

function renderProducts()
{
    productsGrid.innerHTML = '';
    list.forEach((p, i)=>
    {
        const card = document.createElement('article');
        card.className = 'card';
        card.setAttribute('role','listitem');
        card.innerHTML = `
            <img class="thumb" src="https://dummyimage.com/600x400/000/ff0000&text=${p[0]}" alt="placeholder"></img>
            <div class="meta">
                <div class="name">${p[0]}</div>
            </div>
            <div class="actions">
                <button onclick='claim(${i})' class="btn primary">Télécharger</button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

function closeDetail()
{
    document.getElementById("detailModal").classList.remove("show");
}

function claim(i)
{
    const link = document.createElement("a");
    link.download = list[i][1];
    link.href = `dl/${link.download}`;
    link.click();
}