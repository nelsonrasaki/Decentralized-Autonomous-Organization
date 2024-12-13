;; Treasury Contract

(define-trait treasury-trait
  (
    (get-total-weight () (response uint uint))
  )
)

(define-map signers { signer: principal } { weight: uint })
(define-data-var total-weight uint u0)
(define-data-var threshold uint u0)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-threshold-not-met (err u102))

(define-public (add-signer (signer principal) (weight uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set signers { signer: signer } { weight: weight })
    (var-set total-weight (+ (var-get total-weight) weight))
    (ok true)
  )
)

(define-public (remove-signer (signer principal))
  (let ((signer-data (unwrap! (map-get? signers { signer: signer }) err-not-authorized)))
    (begin
      (asserts! (is-eq tx-sender contract-owner) err-owner-only)
      (map-delete signers { signer: signer })
      (var-set total-weight (- (var-get total-weight) (get weight signer-data)))
      (ok true)
    )
  )
)

(define-public (set-threshold (new-threshold uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set threshold new-threshold)
    (ok true)
  )
)

(define-public (transfer (amount uint) (recipient principal))
  (let ((signatures (get-signatures tx-sender)))
    (begin
      (asserts! (>= signatures (var-get threshold)) err-threshold-not-met)
      (stx-transfer? amount tx-sender recipient)
    )
  )
)

(define-private (get-signatures (sender principal))
  (default-to u0 (get weight (map-get? signers { signer: sender })))
)

(define-read-only (get-signer-weight (signer principal))
  (ok (get weight (default-to { weight: u0 } (map-get? signers { signer: signer }))))
)

(define-read-only (get-threshold)
  (ok (var-get threshold))
)

(define-read-only (get-total-weight)
  (ok (var-get total-weight))
)

