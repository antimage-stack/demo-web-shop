const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

//cart

const buttonCart = document.querySelector('.button-cart')
const modalCart = document.querySelector('#modal-cart')
const modalClose = document.querySelector('.modal-close')
const more = document.querySelector('.more')
const navigationLink = document.querySelectorAll('.navigation-link')
const longGoodsList = document.querySelector('.long-goods-list')
const cartTableGoods = document.querySelector('.cart-table__goods')
const cardTableTotal = document.querySelector('.card-table__total')

const getGoods = async () => {
	const result = await fetch('db/db.json')
	if ( !result.ok ) throw 'Erorr'
	return result.json()
}

const cart = {
	cartGoods: [
		{
			id: '099',
			name: 'dior',
			price: '999',
			count: '2'
		},
		{
			id: '090',
			name: 'ceds',
			price: '1000',
			count: '5'
		}
	],
	renderCart(){
		cartTableGoods.textContent = ''
		this.cartGoods.forEach(({id, name, price, count}) => {
			const trGood = document.createElement('tr')
			trGood.className = 'cart-item'
			trGood.dataset.id = id

			trGood.innerHTML = `
				<td>${name}</td>
				<td>${price}</td>
				<td><button class="cart-btn-minus" data-id="${id}">-</button></td>
				<td>${count}</td>
				<td><button class="cart-btn-plus" data-id="${id}">+</button></td>
				<td>${price * count}</td>
				<td><button class="cart-btn-delete" data-id="${id}">x</button></td>
			`
			cartTableGoods.append(trGood)
		})
		const totalPrice = this.cartGoods.reduce((sum, item) => {
			return sum + item.price * item.count
		}, 0)

		cardTableTotal.textContent = totalPrice + '$'
	},
	deleteGood(id){
		this.cartGoods = this.cartGoods.filter( item => id !== item.id )
		this.renderCart()
	},
	minusGood(id){
		for ( const item of this.cartGoods ) {
			if ( item.id === id ) {
				if ( item.count <= 1 ) {
					this.deleteGood(id)
				}
				else {
					item.count--
				}
				break
			}
		}
		this.renderCart()
	},
	plusGood(id){
		for ( const item of this.cartGoods ) {
			if ( item.id === id ) {
				item.count++
				break
			}
		}
		this.renderCart()
	},
	addCartGoods(id){
		const  goodItem = this.cardGoods.find( item => item.id === id )
		if ( goodItem ) {
			this.plusGood(id)
		}
		else {
			getGoods()
				.then( data => data.find( item => item.id === id ))
				.then( ({id, name, price }) => {
					this.cartGoods.push({
						id,
						name,
						price,
						count: 1,
					})
				})
		}
	},
}

document.body.addEventListener('click', e => {
	const addToCart = e.target.closest('.add-to-cart')

	if ( addToCart) {
		cart.addCartGoods( addToCart.dataset.id)
	}
})

cartTableGoods.addEventListener('click', e => {
	const target = e.target
	if ( target.tagName === 'BUTTON') {
		const id = target.closest('.cart-item').dataset.id

		if ( target.classList.contains('cart-btn-delete')) {
			cart.deleteGood(id)
		}
		if ( target.classList.contains('cart-btn-minus')) {
			cart.minusGood(id)
		}
		if ( target.classList.contains('cart-btn-plus')) {
			cart.plusGood(id)
		}
	}
})

const openModal = () => {
	modalCart.classList.add('show')
	cart.renderCart()
}

const closeModal = () => {
	modalCart.classList.remove('show')
}

buttonCart.addEventListener('click', openModal)
modalClose.addEventListener('click', closeModal)
document.addEventListener('click', (e) => {
	if ( e.target.classList.contains('overlay')) modalCart.classList.remove('show')
})

//scrolling smopth 

const scrollLinks = document.querySelectorAll('a.scroll-link')

for ( let i = 0; i < scrollLinks.length; i++ ) {
	scrollLinks[i].addEventListener('click', event => {
		event.preventDefault()
		const id = scrollLinks[i].getAttribute('href')
		document.querySelector(id).scrollIntoView( {
			behavior: 'smooth',
			block: 'start'
		})
	})
}

//goods
const createCard = function(objCard) {
	const card = document.createElement('div')
	card.className = 'col-lg-3 col-sm-6'

	card.innerHTML = `
		<div class="goods-card">
			${objCard.label ? `<span class="label">${objCard.label}</span>` : ''}
			<img src="db/${objCard.img}" alt="${objCard.name}" class="goods-image">
			<h3 class="goods-title>${objCard.name}</h3>
			<p class="goods-description">${objCard.description}</p>
			<button class="button goods-card-btn add-to-cart" data-id="${objCard.id}">
				<span class="button-price">$${objCard.price}</span>
			</button>
		</div>`

	return card
}

const renderCards = function(data) {
	longGoodsList.textContent = ''
	const cards = data.map(createCard)
	longGoodsList.append(...cards) 
	document.body.classList.add('show-goods')
}

more.addEventListener('click', e => {
	e.preventDefault()
	getGoods().then(renderCards)
})

const filterCards = function(field, value) {
	getGoods()
		.then( data => data.filter( good => good[field] === value ))
		.then(renderCards)
}

navigationLink.forEach( function(link) {
	link.addEventListener('click', e => {
		e.preventDefault()
		const field = link.dataset.field
		const value = link.textContent
		filterCards(field, value)
	})
})