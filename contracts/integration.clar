;; Integration Contract

(define-map integrations
  { platform: (string-ascii 20) }
  { api-key: (string-ascii 64), webhook-url: (string-ascii 256) }
)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-platform (err u101))

(define-public (add-integration (platform (string-ascii 20)) (api-key (string-ascii 64)) (webhook-url (string-ascii 256)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set integrations { platform: platform } { api-key: api-key, webhook-url: webhook-url }))
  )
)

(define-public (remove-integration (platform (string-ascii 20)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-delete integrations { platform: platform }))
  )
)

(define-read-only (get-integration (platform (string-ascii 20)))
  (ok (unwrap! (map-get? integrations { platform: platform }) err-invalid-platform))
)

;; This function would be called by other contracts to trigger notifications
(define-public (notify (platform (string-ascii 20)) (message (string-utf8 1000)))
  (let ((integration (unwrap! (map-get? integrations { platform: platform }) err-invalid-platform)))
    ;; In a real-world scenario, this would trigger an actual API call or webhook
    ;; For this example, we'll just return success
    (ok true)
  )
)

