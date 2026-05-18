document.getElementById('deleteProduct').addEventListener('click', async (e) => {
    const productId = e.target.dataset.id;
    const _csrf = e.target.dataset.csrftoken;

    console.log(e.target.dataset)

    await fetch(`/admin/delete-product/${productId}`, {
        method: 'DELETE',
        //
        headers: {
            "csrf-token": _csrf
        }
    })
        // .then(r => r.json())
        .then(data => {
            e.target.parentElement.closest('article').closest('div').remove();
            console.log(data);
        }).catch(err => {
            console.log(err);
        })
})