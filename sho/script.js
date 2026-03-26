let uuid = "";

products = [];
limits = {};

let cart = {};

const productsGrid = document.getElementById('productsGrid');
const cartCount = document.getElementById('cartCount');
const miniCart = document.getElementById('miniCart');
const miniTotal = document.getElementById('miniTotal');

function load_sho()
{
    if (localStorage.getItem("uuid") == null)
        back();
    
    uuid = localStorage.getItem("uuid");

    document.getElementById('cartModal').classList.remove('show');

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?amount=true&uuid=${uuid}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                let res = parseInt(httpRequest.responseText);
                document.getElementById("solde").innerHTML = `K${res}`;
                localStorage.setItem('balance', res);
            }
        }
    }

    var httpRequest2 = getHttpRequest();
    httpRequest2.open('GET', `db.php?products=true&uuid=${uuid}`, true);
    httpRequest2.send();
    httpRequest2.onreadystatechange = function ()
    {
        if (httpRequest2.readyState === 4)
        {
            if (httpRequest2.status === 200)
            {
                products = JSON.parse(httpRequest2.responseText.split('|')[0]);
                limits = JSON.parse(httpRequest2.responseText.split('|')[1]);

                loadCart();
                renderProducts(products);
                renderCart();
            }
        }
    }
}

function priceFmt(n) {return 'K' + parseInt(n)}

function renderProducts(list)
{
    productsGrid.innerHTML = '';
    list.forEach(p=>
    {
        if (p.stock == -1) stock = '&#8734;';
        else stock = p.stock;
        
        if (p.limit == -1) limit = `Limite: &#8734;`;
        else limit = `Limite: ${limits[p.name]}/${p.limit}`;

        if (limits[p.name] >= p.limit && p.limit > 0 || p.stock == 0) html = `style = "background: gray"`;
        else html = ``;

        const card = document.createElement('article');
        card.className = 'card';
        card.setAttribute('role','listitem');
        card.innerHTML = `
            <div class="thumb" style="background-image: url('assets/${p.name.toLowerCase()}.png'")></div>
            <div class="meta">
                <div class="name">${p.name}</div>
                <div class="price">${priceFmt(p.price)}</div>
                <div class="name">Stock: ${stock}</div>
                <div class="name">${limit}</div>
            </div>
            <div class="desc">${p.description}</div>
            <div class="actions">
                <button class="btn" data-id="${p.id}">Détails</button>
                <button class="btn primary" data-buy="${p.id}" ${html}>Ajouter</button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

function addToCart(id, qty=1)
{
    const p = products.find(x=>x.id===id);
    if (!p) return;

    if (limits[p.name] >= p.limit && p.limit > 0) return;
    if (p.stock == 0) return;

    if (p.limit > 0)
    {
        limits[p.name] += qty;

        document.getElementsByClassName("card")[id-1].children[1].children[3].innerHTML = `Limite: ${limits[p.name]}/${products[id-1].limit}`;

        if (limits[p.name] >= p.limit)
            document.getElementsByClassName("card")[id-1].children[3].children[1].style.background = "gray"
    }

    if (p.stock > 0)
    {
        p.stock -= qty;

        document.getElementsByClassName("card")[id-1].children[1].children[2].innerHTML = `Stock: ${p.stock}`;

        if (p.stock <= 0)
            document.getElementsByClassName("card")[id-1].children[3].children[1].style.background = "gray"
    }

    cart[id] = (cart[id]||0) + qty;
    saveCart();
    renderCart();
}

function removeFromCart(id)
{
    cart[id]--;
    if (!cart[id]) delete cart[id];

    const p = products.find(x=>x.id===id);

    if (products[id-1].limit > 0)
    {
        limits[p.name] -= 1;

        document.getElementsByClassName("card")[id-1].children[1].children[3].innerHTML = `Limite: ${limits[p.name]}/${products[id-1].limit}`;
        document.getElementsByClassName("card")[id-1].children[3].children[1].style.background = "linear-gradient(90deg,var(--accent),var(--accent2))";
    }

    if (products[id-1].stock > 0)
    {
        products[id-1].stock++;

        document.getElementsByClassName("card")[id-1].children[1].children[2].innerHTML = `Stock: ${products[id-1].stock}`;
        document.getElementsByClassName("card")[id-1].children[3].children[1].style.background = "linear-gradient(90deg,var(--accent),var(--accent2))";
    }

    saveCart();
    renderCart();
}

function cartSubtotal()
{
    return Object.entries(cart).reduce((s,[id,qty])=>
    {
        const p = products.find(x=>x.id==id);
        return s + (p.price * qty||0);
    },0);
}

function renderCart()
{
    const count = Object.values(cart).reduce((a,b)=>a+b,0);

    if(count === 0)
    {
        miniCart.textContent='Aucun article';
        miniTotal.textContent='K0';
    }
    else
    {
        miniCart.innerHTML = Object.entries(cart).map(([id,qty])=>
        {
            const p = products.find(x=>x.id==id);
            return `<div style="display:flex;justify-content:space-between;margin-bottom:6px"><div style="color:var(--muted)">${p.name} × ${qty}</div><div style="font-weight:700">${priceFmt(p.price*qty)}</div></div>`;
        }).join('');
        miniTotal.textContent = priceFmt(cartSubtotal());
    }

    const cartList = document.getElementById('cartList');
    cartList.innerHTML = Object.entries(cart).length===0 ? '<div style="color:var(--muted)">Panier vide</div>' : Object.entries(cart).map(([id,qty])=>
    {
        const p = products.find(x=>x.id==id);
        return `<div class="cart-item"><div class="small-thumb">img</div><div style="flex:1"><div style="font-weight:700">${p.name}</div><div style="font-size:13px;color:var(--muted)">${qty} × ${priceFmt(p.price)}</div></div><div style="font-weight:800">${priceFmt(p.price*qty)}</div><div style="margin-left:8px"><button class="btn" data-rm="${id}">—</button></div></div>`;
    }).join('');

    document.getElementById('cartSubtotal').textContent = priceFmt(cartSubtotal());

    saveCart();
}

function saveCart()
{
    //localStorage.setItem('demo_cart', JSON.stringify(cart));
}

function loadCart()
{
/*    try {cart = JSON.parse(localStorage.getItem('demo_cart')||'{}');}
    catch(e) {cart={};}*/
    cart = {}
}
document.getElementById('cartModal').classList.add('show');
// events
document.addEventListener('click',e=>
{
    try
    {
        if (document.getElementById('cartModal').classList.contains('show') && !document.getElementsByClassName('box')[0].contains(e.target)) {document.getElementById('cartModal').classList.remove('show'); return;}
        if(e.target.matches('[data-buy]')) addToCart(Number(e.target.getAttribute('data-buy')));
        if(e.target.matches('[data-id]')) showDetails(Number(e.target.getAttribute('data-id')));
        if(e.target.matches('#openCart')) parent.redirect("dep");//window.location.href = window.location.href.replace("sho", "dep");
        if(e.target.matches('#viewCart')) document.getElementById('cartModal').classList.add('show');
        if(e.target.matches('#closeCart')) document.getElementById('cartModal').classList.remove('show');
        if(e.target.matches('[data-rm]')) removeFromCart(Number(e.target.getAttribute('data-rm')));
        if(e.target.matches('#finalCheckout') || e.target.matches('#checkout'))
        {
            document.getElementById('cartModal').classList.remove('show');
            if(Object.keys(cart).length===0) {showLabel('Panier vide.'); return;}
            
            command();
        }
    }
    catch {}
});

function command()
{
    if (cart['5'])
    {
        document.body.innerHTML +=
        `
            <div class="popup-container" id="popup">
                <form class="popup-form" onsubmit="pursue(this); return false;">
                    <label for="texte">Assassinat</label>
                </form>
            </div>
        `;

        for (i = 0; i < cart['5']; i++)
            document.getElementsByClassName("popup-form")[0].innerHTML += `<input type="text" id="cible${i}" placeholder="Cible n°${i+1}" required></input>`;

        document.getElementsByClassName("popup-form")[0].innerHTML += `<button type="submit">Valider</button>`;
    }
    else pursue();
}

function pursue(e=false)
{
    let cibles = "";
    if (e)
        for (i = 0; i < cart['5']; i++) cibles += `${document.getElementById(`cible${i}`).value}  `;
    try {document.getElementsByClassName("popup-form")[0].remove();} catch {}
    let c = "";
    for (i = 1; i <= products.length; i++)
    {
        if (cart[i])
            c += `&${i}=${cart[i]}`;
        else c += `&${i}=0`;
    }
    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?command=true&uuid=${uuid}${c}&cibles=${cibles}`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                let res = parseInt(httpRequest.responseText);
                if (res == -1)
                    showLabel("Solde insuffisant");
                else
                {
                    document.getElementById("solde").innerHTML = `K${res}`;
                    localStorage.setItem('balance', res);

                    cart = {};
                    saveCart();
                    renderCart();
                    document.getElementById('cartModal').classList.remove('show');

                    showLabel("Commande passée");
                }
            }
        }
    }
}

const subtitle = document.querySelector('.subtitle');
subtitle.textContent = 'Dépense tes krollars';

let currentProduct = null;

function showDetails(productId) 
{
    product = products[productId-1];
    currentProduct = product;

    if (limits[product.name] >= product.limit && product.limit > 0)
        document.querySelector("#detailModal > div > button").style.background = "gray";
    else
        document.querySelector("#detailModal > div > button").style.background = "linear-gradient(90deg, var(--accent), var(--accent2))";

    document.getElementById("detailName").innerText = product.name;
    document.getElementById("detailDesc").innerText = product.description;
    document.getElementById("detailPrice").innerText = `K${product.price}`;
    document.getElementById("detailModal").classList.add("show");
    document.getElementsByClassName("detail-thumb")[0].style.backgroundImage = `url("assets/${product.name.toLowerCase()}.png"`;
}

function closeDetail() 
{
    document.getElementById("detailModal").classList.remove("show");
}

function showLabel(s)
{
	const label = document.getElementById('label');
	label.innerHTML = s;

	label.classList.add('visible');

	setTimeout(() =>
	{
		label.classList.remove('visible');
	}, 2000);
}

var getHttpRequest = function ()
{
	var httpRequest = false;

	if (window.XMLHttpRequest)
    {
		httpRequest = new XMLHttpRequest();
		if (httpRequest.overrideMimeType)
			httpRequest.overrideMimeType('text/xml');
	}
	else if (window.ActiveXObject)
    {
		try
        {
			httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e)
        {
			try
            {
				httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e) {}
		}
	}
	if (!httpRequest)
		return false;
	return httpRequest;
}